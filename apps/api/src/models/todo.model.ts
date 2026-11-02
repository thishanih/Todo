import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import {
  TODO_DESCRIPTION_MAX_LENGTH,
  TODO_TITLE_MAX_LENGTH,
  TODO_TITLE_MIN_LENGTH,
} from '../shared/todo-limits.js';

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [TODO_TITLE_MIN_LENGTH, 'Title cannot be empty.'],
      maxlength: [
        TODO_TITLE_MAX_LENGTH,
        `Title cannot exceed ${TODO_TITLE_MAX_LENGTH} characters.`,
      ],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [
        TODO_DESCRIPTION_MAX_LENGTH,
        `Description cannot exceed ${TODO_DESCRIPTION_MAX_LENGTH} characters.`,
      ],
    },
    done: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

todoSchema.plugin(mongooseAggregatePaginate);

export const Todo = mongoose.model('Todo', todoSchema);
