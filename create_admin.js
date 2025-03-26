const Admin = require("./src/models/admin.models");

const createAdmins = async () => {
  try {
    const admins = [
      {
        name: "Super Admin",
        email: "foodimetric@gmail.com",
        password: "Foodimetric2023.",
        role: "super-admin",
      },
      {
        name: "Folake Sowonoye",
        email: "follycube2020@gmail.com",
        password: "Foodimetricadmin123",
        role: "admin",
      },
      {
        name: "Ayomide Ademola",
        email: "ademolaayomide121@gmail.com",
        password: "Foodimetricadmin123",
        role: "admin",
      },
      {
        name: "Aderemi Damilola",
        email: "remidex9920@gmail.com",
        password: "Foodimetricadmin123",
        role: "admin",
      },
    ];

    await Admin.insertMany(admins);
    console.log("Admins created successfully");
  } catch (error) {
    console.error("Error creating admins:", error);
  } finally {
  }
};

module.exports = {createAdmins}
