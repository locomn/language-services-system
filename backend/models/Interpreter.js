const mongoose = require('mongoose');

const LANGUAGES = {
    AFAR: 'Afar',
    AFRIKAANS: 'Afrikaans',
    AKAN: 'Akan',
    ALBANIAN: 'Albanian',
    ASL: 'American Sign Language',
    AMHARIC: 'Amharic',
    ANUAK: 'Anuak',
    ARABIC: 'Arabic',
    ARAMAIC: 'Aramaic',
    ARMENIAN: 'Armenian',
    // ... more languages
    VIETNAMESE: 'Vietnamese',
    VISAYAN: 'Visayan',
    WOLOF: 'Wolof',
    YIDDISH: 'Yiddish',
    YORUBA: 'Yoruba'
};

const STATES = ['MN', 'WI'];
const COMMENT_TYPES = {
    BCA: 'BCA',
    CERTIFICATION_LEVEL: 'Certification Level',
    CHEST_XRAY_DATE: 'Chest X-Ray Date',
    CHICKEN_POX: 'Chicken Pox',
    COMMENDATIONS: 'Commendations',
    COMPLAINTS: 'Complaints',
    COURT_CERTIFIED: 'Court Certified',
    COURT_ETHICS_PASSED: 'Court Ethics Passed',
    COURT_ROSTER: 'Court Roster',
    DEACTIVATE_DATE: 'Deactivate Date',
    DRUG_PLEDGE: 'Drug Pledge',
    EDUCATION: 'Education',
    HEPATITIS_B_STATUS: 'Hepatitis B Status',
    ID_BADGE_ISSUED_DATE: 'ID Badge Issued Date',
    INTERPRETIVE_COURSE: 'Interpretive Course',
    KTTS_MEDICAL_TERMINOLOGY: 'KTTS Medical Terminology',
    MANTOUX_TEST_DATE: 'Mantoux Test (TB) Date',
    MEDICAL_TERMINOLOGY_COURSE: 'Medical Terminology Course',
    MMR_DATE: 'MMR Date',
    ORIENTATION: 'Orientation',
    OTHER_COMMENTS: 'Other Comments',
    REACTIVE_DATE: 'Reactive Date',
    START_DATE: 'Start Date',
    TRANSLATOR: 'Translator'
};

const interpreterLanguageSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true,
        enum: Object.values(LANGUAGES)
    },
    isTranslator: {
        type: Boolean,
        default: false
    },
    certifications: [{
        type: String,
        trim: true
    }]
});

const interpreterSchema = new mongoose.Schema({
    interpreterId: {
        type: String,
        required: true,
        unique: true
    },
    ssn: {
        type: String,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    middleName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    nickname: {
        type: String,
        trim: true
    },
    namePrefix: {
        type: String,
        trim: true
    },
    nameSuffix: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['M', 'F', 'X'],
        required: true
    },
    badgeNumber: {
        type: String,
        trim: true
    },
    stateRosterId: {
        type: String,
        trim: true
    },
    oldRosterId: {
        type: String,
        trim: true
    },
    contact: {
        homePhone: {
            type: String,
            trim: true
        },
        cellPhone: {
            type: String,
            trim: true
        },
        fax: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        }
    },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: {
            type: String,
            enum: STATES
        },
        zipCode: String
    },
    externalId: {
        type: String,
        trim: true
    },
    settings: {
        isActive: {
            type: Boolean,
            default: true
        },
        autoAssign: {
            type: Boolean,
            default: false
        },
        canAcceptRequestedAppointments: {
            type: Boolean,
            default: true
        },
        canAcceptAvailableAppointments: {
            type: Boolean,
            default: true
        }
    },
    languages: [interpreterLanguageSchema],
    comments: {
        type: String,
        trim: true
    },
    commentHistory: [{
        type: {
            type: String,
            enum: Object.values(COMMENT_TYPES)
        },
        content: String,
        addedBy: String,
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    termination: {
        isTerminated: {
            type: Boolean,
            default: false
        },
        dontRehire: {
            type: Boolean,
            default: false
        },
        terminationDate: Date,
        terminationTime: String,
        terminatedBy: String,
        reinstatedDate: Date,
        reinstatedBy: String
    },
    managementNotes: {
        type: String,
        trim: true
    },
    metadata: {
        createdBy: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        lastModifiedBy: {
            type: String,
            required: true
        },
        lastModifiedAt: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

// Index for efficient searching
interpreterSchema.index({ firstName: 1, lastName: 1 });
interpreterSchema.index({ 'languages.language': 1 });
interpreterSchema.index({ interpreterId: 1 }, { unique: true });
interpreterSchema.index({ 'settings.isActive': 1 });
interpreterSchema.index({ 'address.city': 1 });
interpreterSchema.index({ externalId: 1 });
interpreterSchema.index({ badgeNumber: 1 });
interpreterSchema.index({ stateRosterId: 1 });

// Static method to get all supported languages
interpreterSchema.statics.getLanguages = function() {
    return Object.values(LANGUAGES);
};

// Method to add a language
interpreterSchema.methods.addLanguage = function(language, isTranslator = false, certifications = []) {
    if (!Object.values(LANGUAGES).includes(language)) {
        throw new Error('Invalid language');
    }
    
    const existingLang = this.languages.find(l => l.language === language);
    if (existingLang) {
        throw new Error('Language already exists for this interpreter');
    }

    this.languages.push({
        language,
        isTranslator,
        certifications
    });
};

// Static method to get all comment types
interpreterSchema.statics.getCommentTypes = function() {
    return Object.values(COMMENT_TYPES);
};

// Method to add a comment
interpreterSchema.methods.addComment = function(type, content, userId) {
    if (!Object.values(COMMENT_TYPES).includes(type)) {
        throw new Error('Invalid comment type');
    }

    this.commentHistory.push({
        type,
        content,
        addedBy: userId,
        addedAt: new Date()
    });
};

// Method to terminate interpreter
interpreterSchema.methods.terminate = function(userId, dontRehire = false) {
    this.termination = {
        isTerminated: true,
        dontRehire,
        terminationDate: new Date(),
        terminationTime: new Date().toLocaleTimeString(),
        terminatedBy: userId
    };
};

// Method to reinstate interpreter
interpreterSchema.methods.reinstate = function(userId) {
    if (!this.termination.isTerminated) {
        throw new Error('Interpreter is not terminated');
    }

    this.termination.isTerminated = false;
    this.termination.reinstatedDate = new Date();
    this.termination.reinstatedBy = userId;
};

// Static method to search interpreters
interpreterSchema.statics.searchInterpreters = async function(criteria) {
    const query = {};
    
    if (criteria.firstName) {
        query.firstName = new RegExp(criteria.firstName, 'i');
    }
    if (criteria.lastName) {
        query.lastName = new RegExp(criteria.lastName, 'i');
    }
    if (criteria.interpreterId) {
        query.interpreterId = criteria.interpreterId;
    }
    if (criteria.gender) {
        query.gender = criteria.gender;
    }
    if (criteria.language) {
        query['languages.language'] = criteria.language;
    }
    if (criteria.isTranslator) {
        query['languages.isTranslator'] = true;
    }
    
    // Handle active/non-active filter
    if (criteria.showActive && !criteria.showNonActive) {
        query['settings.isActive'] = true;
    } else if (!criteria.showActive && criteria.showNonActive) {
        query['settings.isActive'] = false;
    }
    // If both or neither are selected, don't filter by active status

    const page = criteria.page || 1;
    const limit = criteria.limit || 20;
    const skip = (page - 1) * limit;

    const interpreters = await this.find(query)
        .sort({ lastName: 1, firstName: 1 })
        .skip(skip)
        .limit(limit);

    const total = await this.countDocuments(query);

    return {
        interpreters,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
};

const Interpreter = mongoose.model('Interpreter', interpreterSchema);
module.exports = Interpreter;
