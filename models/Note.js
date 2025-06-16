const { mongoose } = require('mongoose');

const noteSchema = new mongoose.Schema({
    id: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    lastEditedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    lastEditedAt: {
        type: Date,
        default: Date.now
    }
});

noteSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
        strictPopulate: false
    });
    next();
});

noteSchema.pre('save', function (next) {
    this.lastEditedAt = Date.now();
    next();
});

noteSchema.pre('findOneAndUpdate', function (next) {
    this.lastEditedAt = Date.now();
    next();
});

module.exports = mongoose.model('Note', noteSchema);