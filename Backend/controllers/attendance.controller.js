const Attendance = require("../models/attendance.model");


exports.createAttendance = async (req,res,next)=>{

try{

const result = await Attendance.createAttendance(req.body);

res.status(201).json({
message:"Attendance created",
attendance_id:result.insertId
});

}catch(err){
next(err);
}

};



exports.getMyAttendance = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    if (!employeeId) return res.status(400).json({ message: "employee_id not in token" });
    const rows = await Attendance.getMyAttendance(employeeId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};


exports.getAllAttendance = async (req,res,next)=>{

try{

const rows = await Attendance.getAllAttendance();

res.json(rows);

}catch(err){
next(err);
}

};



exports.autoCheckout = async (req, res, next) => {
  try {
    const { employee_id } = req.body;
    if (!employee_id) return res.status(400).json({ message: "employee_id required" });
    await Attendance.autoCheckout(employee_id);
    res.json({ message: "checked out" });
  } catch (err) {
    next(err);
  }
};

exports.updateAttendance = async (req,res,next)=>{

try{

const id = req.params.id;

const result = await Attendance.updateAttendance(id,req.body);

if(result.affectedRows===0){
return res.status(404).json({message:"Attendance not found"});
}

res.json({
message:"Attendance updated"
});

}catch(err){
next(err);
}

};