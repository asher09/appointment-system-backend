import { Appointment } from './../models/Appointment';
import { AuthenticatedType } from './../types/AuthenticatedType';
import { Response, Request } from 'express';
import { Types } from 'mongoose';

export const createAvailability = async (req: AuthenticatedType, res: Response) : Promise<void> => {
    const professorId = req.user?.id;
    const userRole = req.user?.role;

    if(!professorId ||userRole !== 'professor') {
        res.status(403).json({
            message: "Access denied"
        })
        return;
    } 

    //make sures startTime is after endTIme
    // if(!startTime || !endTime ) {
    //     res.status(400).json({message: "Invalid start or end time"});
    //     return;
    // }

    //prevent overlapping slots
    const {startTime, endTime} = req.body;
    const overlap = await Appointment.findOne({
        professor: professorId,
        $or: [{
            startTime: {$lt: new Date(endTime)},
            endTime: {$gt: new Date(startTime)} 
        }]
    })
    if(overlap) {
        res.status(400).json({message: "slot already exists"})
        return;
    }

    try {
        const newAppointment = new Appointment({
            professor: professorId,
            status: "available",
            startTime: new Date(req.body.startTime),
            endTime: new Date(req.body.endTime),
        });
        
        await newAppointment.save();
        res.status(201).json(newAppointment);

    } catch {
        console.error(Error)
        res.status(401).json({message: "error while creating availability"})
    }


};

export const getAvailableAppointments = async(req:Request & AuthenticatedType, res:Response) => {
    const professorId = req.params.id;
     if (!professorId) {
        res.status(400).json({ message: 'professorId is required' });
        return;
    }
    //unauthorized access
    if(!req.user) {
        res.status(401).json({message: "unauthorized"})
    }
    const availableAppointments = await Appointment.find({
        professor: professorId,
        status: "available"
    }).select('startTime endTime');
    res.status(201).json(availableAppointments)

};

export const bookAppointment = async(req:Request & AuthenticatedType, res:Response) => {
    const {id} = req.params;
    const studentId = req.user?.id;
    const userRole = req.user?.role;

    try {
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            res.status(404).json({
                message: "Appointment not found."
            });
            return;
        }
        //can same student books a slot with same professor for same time

        //no double booking for same time
        if(appointment.status !== 'available' ) {
            res.status(400).json({message: "Appointment is already booked"})
            return;
        }



        // //student already have an appointment booked at this time

        // const overlapping = await Appointment.findOne({
        //     student: studentId,
        //     professor: appointment.professor,
        //     status: 'booked',
        //     $or: [
        //         {
        //             startTime: { $lt: appointment.endTime},
        //             endTime: {$gt: appointment.startTime}
        //         }
        //     ]
        // });
        // if(overlapping) {
        //     res.status(400).json({message: "You already have an appointment booked with this professor at this time."})
        //     return;
        // }

        appointment.status = 'booked';
        appointment.student = new Types.ObjectId(studentId);

        await appointment.save();

        res.status(200).json({ 
            message: 'Appointment booked successfully.', 
            appointment 
        });
    } catch (error) {
        console.error('error booking appointment:', error);
        res.status(500).json({ message: 'failed to book appointment.' });
    }
};

export const cancelAppointment = async(req:Request & AuthenticatedType, res:Response) => {
    const { id } = req.params;
    const professorId = req.user?.id;
    const userRole = req.user?.role;

    if(userRole!='professor') {
        res.status(403).json({
            message: 'Only Professor can cancel appointments'
        })
    }

    const appointment = await Appointment.updateOne(
            { _id: id, professor: professorId, status: { $ne: 'cancelled' } },
            { status: 'cancelled' }
        );
    if (!appointment) {
        res.status(404).json({ message:'appointment not found' });
        return;
    }
    res.status(200).json({message: "appointment cancelled successfully"})



};

export const getMyAppointments = async(req:Request & AuthenticatedType, res:Response) => {
    const studentId = req.user?.id;
    const userRole = req.user?.role;

    //unauthorized access
    if(!studentId || userRole !== 'student') {
        res.status(403).json({message: "Access Denied"});
        return;
    }
    const myAppointments = await Appointment.find({
            student: studentId,
            status: 'booked',
        })

        res.status(200).json(myAppointments);
};