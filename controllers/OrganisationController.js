import organizationModel from "../models/OrganisationModel.js";
import userModel from "../models/userModel.js";

export const RegisterOrganisation = async (req, res) => {
  try {
    const { companyName, industry, adminEmail, adminPhone, password, billing, address, logoUrl, gstNumber } = req.body;

    const org = await organizationModel.create({
      companyName, 
      industry, 
      adminEmail, 
      adminPhone,
      billing,
      address,
      logoUrl,
      gstNumber
    });

    const admin = await userModel.create({
      name: companyName,
      email: adminEmail,
      phone: adminPhone,
      password,
      role: "admin",
      organisationId: org._id,
      EmpUsername: adminEmail.split("@")[0]  // fallback
    });

    res.json({ message: "Organisation registered", org, admin });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
