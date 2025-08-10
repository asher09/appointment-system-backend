import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema({
    professor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: false,
        enum: ["booked", "cancelled", "available"]
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false
    }
})


export const Appointment = mongoose.model("Appointment", appointmentSchema);
