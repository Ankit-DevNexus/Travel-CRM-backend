import organizationModel from '../models/OrganisationModel.js';
import userModel from '../models/userModel.js';

// export const RegisterOrganisation = async (req, res) => {
//   try {
//     const { companyName, industry, adminEmail, adminPhone, password, billing, address, logoUrl, gstNumber } = req.body;

//     const org = await organizationModel.create({
//       companyName,
//       industry,
//       adminEmail,
//       adminPhone,
//       billing,
//       address,
//       logoUrl,
//       gstNumber,
//     });

//     const admin = new userModel({
//       EmpUsername: adminEmail.split('@')[0],
//       name: companyName,
//       email: adminEmail,
//       phone: adminPhone,
//       password,
//       role: 'admin',
//       organisationId: org._id,
//     });

//     await admin.save(); // ensures pre('save') runs and password is hashed

//     res.json({ message: 'Organisation registered', org, admin });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };

export const RegisterOrganisation = async (req, res) => {
  try {
    const { companyName, industry, adminEmail, adminPhone, password, billing, address, logoUrl, gstNumber } = req.body;

    // Create Organisation
    const org = await organizationModel.create({
      companyName,
      industry,
      adminEmail,
      adminPhone,
      billing,
      address,
      logoUrl,
      gstNumber,
    });

    // Generate unique Admin ID (ADM-A0001 pattern)
    const lastAdmin = await userModel.findOne({ role: 'admin' }).sort({ createdAt: -1 }).select('userId').lean();

    let newAdminId = 'ADM-A0001'; // default for first admin

    if (lastAdmin && lastAdmin.userId) {
      // extract number after 'ADM-A' safely
      const match = lastAdmin.userId.match(/ADM-A(\d+)/);
      const lastNumber = match ? parseInt(match[1]) : 0;
      const nextNumber = lastNumber + 1;
      newAdminId = `ADM-A${nextNumber.toString().padStart(4, '0')}`;
    }

    // Create Admin User
    const admin = new userModel({
      userId: newAdminId,
      EmpUsername: adminEmail.split('@')[0],
      email: adminEmail,
      phone: adminPhone,
      password,
      role: 'admin',
      organisationId: org._id,
    });

    await admin.save();

    // Link adminId to organisation
    org.adminId = admin._id;
    await org.save();

    res.json({
      message: 'Organisation registered successfully',
      organisation: org,
      admin,
    });
  } catch (err) {
    console.error('RegisterOrganisation Error:', err);
    res.status(500).json({ msg: err.message });
  }
};

export const getAllOrganisations = async (req, res) => {
  try {
    // Fetch all organisations
    const organisations = await organizationModel.find().lean();

    // For each organisation, find its admin(s)
    const organisationsWithAdmins = await Promise.all(
      organisations.map(async (org) => {
        const admin = await userModel
          .findOne({
            organisationId: org._id,
            role: 'admin',
          })
          .select('-password'); // exclude password

        return {
          ...org,
          admin,
        };
      }),
    );

    res.status(200).json({
      message: 'All organisations fetched successfully',
      totalorganisations: organisations.length,
      organisations: organisationsWithAdmins,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching organisations',
      error: error.message,
    });
  }
};

// export const RegisterOrganisation = async (req, res) => {
//   try {
//     const { companyName, industry, adminEmail, adminPhone, password, billing, address, logoUrl, gstNumber } = req.body;

//     const org = await organizationModel.create({
//       companyName,
//       industry,
//       adminEmail,
//       adminPhone,
//       billing,
//       address,
//       logoUrl,
//       gstNumber,
//     });

//     let newAdminId = 'ADM-A0001';
//     if (lastAdmin && lastAdmin.adminId) {
//       const lastNumber = parseInt(lastAdmin.userId.replace('ADM-A', '')) || 0;
//       const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
//       newAdminId = `ADM-A${nextNumber}`;
//     }

//     const admin = new userModel({
//       userId: newAdminId, // auto-generated admin ID
//       EmpUsername: adminEmail.split('@')[0],
//       name: companyName,
//       email: adminEmail,
//       phone: adminPhone,
//       password,
//       role: 'admin',
//       organisationId: org._id,
//     });

//     await admin.save(); // ensures pre('save') runs and password is hashed

//     // Link adminId to organisation
//     org.adminId = admin._id;
//     await org.save();

//     res.status(201).json({
//       success: true,
//       message: 'Organisation and Admin registered successfully',
//       organisation: org,
//       admin,
//     });
//   } catch (err) {
//     res.status(500).json({ msg: err.message });
//   }
// };
