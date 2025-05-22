import mongoose from 'mongoose';

const libraryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  semester: {
    type: String,
    enum: ['First(1st)', 'Second(2nd)', 'Third(3rd)', 'Fourth(4th)', 'Fifth(5th)', 'Sixth(6th)', 'Seventh(7th)', 'Eighth(8th)'],
    required: [true, 'Semester is required']
  },
  files: [{
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number
    },
    mimetype: {
      type: String
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const LibraryItem = mongoose.model('LibraryItem', libraryItemSchema);

export default LibraryItem;