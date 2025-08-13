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

    const myAppointments = await Appointment.find({
            student: studentId,
            status: 'booked',
        })

        res.status(200).json(myAppointments);
};