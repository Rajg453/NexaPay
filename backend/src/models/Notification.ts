import mongoose, { Document, Model, Schema } from 'mongoose';

// Detailed explanation: We define an interface for the Notification document.
// This helps TypeScript understand what properties exist on a Notification object.
export interface INotification extends Document {
  user: mongoose.Types.ObjectId; // References the User who owns this notification
  message: string;               // The actual notification text to display
  read: boolean;                 // Whether the user has seen this notification
  createdAt: Date;               // When the notification was created
  updatedAt: Date;               // When the notification was last updated
}

// Detailed explanation: We create the Mongoose schema, which tells MongoDB
// how to structure the data for a Notification.
const notificationSchema = new Schema<INotification>(
  {
    // The 'user' field links this notification to a specific user in the database.
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User', // This tells Mongoose that this ObjectId refers to the 'User' model
      required: true, // A notification MUST belong to a user
    },
    // The 'message' field stores the text of the notification.
    message: {
      type: String,
      required: true, // A notification MUST have a message
    },
    // The 'read' field tracks if the user has clicked/viewed the notification.
    read: {
      type: Boolean,
      default: false, // By default, a new notification is unread (false)
    },
  },
  { 
    // The 'timestamps: true' option automatically creates and updates 'createdAt' and 'updatedAt' fields.
    timestamps: true 
  }
);

// Detailed explanation: We compile the schema into a Mongoose model.
// This model allows us to interact with the 'notifications' collection in the database.
const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
