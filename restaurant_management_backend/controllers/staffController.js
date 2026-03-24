const User = require('../models/User');

// @desc    Get all staff members (including Admins)
// @route   GET /api/staff
// @access  Private (Admin only)
const getStaffMembers = async (req, res, next) => {
    try {
        const staff = await User.find({ role: { $in: ['Staff', 'Admin'] } }).select('-password');
        res.status(200).json(staff);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new staff member
// @route   POST /api/staff
// @access  Private (Admin only)
const createStaffMember = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Staff',
            phone
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin only)
const deleteStaffMember = async (req, res, next) => {
    try {
        const staff = await User.findById(req.params.id);

        if (!staff || (staff.role !== 'Staff' && staff.role !== 'Admin')) {
            res.status(404);
            throw new Error('Staff member not found');
        }

        // Prevent admin from deleting themselves
        if (staff._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('Admins cannot delete themselves');
        }

        await staff.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        next(error);
    }
};

// @desc    Update staff member role or info
// @route   PUT /api/staff/:id
// @access  Private (Admin only)
const updateStaffMember = async (req, res, next) => {
    try {
        let staff = await User.findById(req.params.id);

        if (!staff || (staff.role !== 'Staff' && staff.role !== 'Admin')) {
            res.status(404);
            throw new Error('Staff member not found');
        }

        staff = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select('-password');

        res.status(200).json(staff);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStaffMembers,
    createStaffMember,
    deleteStaffMember,
    updateStaffMember,
};
