const { mongoose } = require('mongoose');

const blockSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: false
    },
    note_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Note',
        required: true,
        unique: false
    },
    parent_id: {
        type: String,
        default: null
    },
    type: {
        type: String,
        required: true
    },
    content: mongoose.Schema.Types.Mixed,
    props: mongoose.Schema.Types.Mixed,
    order_index: {
        type: Number,
        default: 0,
        required: true
    },
    children: {
        type: Array,
        default: [],
    },
    createAt: {
        type: Date,
        default: Date.now
    },
    updateAt: {
        type: Date,
        default: Date.now
    }
});

blockSchema.pre('save', function (next) {
    this.updateAt = Date.now();
    next();
});

blockSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'note_id',
        select: 'title',
        strictPopulate: false
    });
    next();
});

blockSchema.pre(/^findOne/, function (next) {
    this.populate({
        path: 'note_id',
        select: 'title',
        strictPopulate: false
    });
    next();
});

blockSchema.pre(/^findOneAndUpdate/, function (next) {
    this.updateAt = Date.now();
    next();
});

module.exports = mongoose.model('Block', blockSchema);