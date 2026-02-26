"use server";

import connectToDB from "@/database";
import User from "@/models/user";
import { revalidatePath } from "next/cache";

//add new user action

export async function addNewUserAction(formData, pathToRevalidate) {
  await connectToDB();

  try {
    //validate data using joi/ other packages you can use

    const newlyCreatedUser = await User.create(formData);
    if (newlyCreatedUser) {
      // Wrap revalidatePath in try-catch to handle test environment errors
      try {
        revalidatePath(pathToRevalidate);
      } catch (revalidateError) {
        // Silently ignore revalidatePath errors in test environment
        // This is expected when running integration tests
        if (!process.env.MONGO_URI_TEST) {
          throw revalidateError;
        }
      }
      return {
        success: true,
        message: "User added successfully",
      };
    } else {
      return {
        success: false,
        message: "Some error occured! Please try again",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Some error occured! Please try again",
    };
  }
}

//fetch users actions
export async function fetchUsersAction() {
  await connectToDB();
  try {
    const listOfUsers = await User.find({});
    if (listOfUsers) {
      return {
        success: true,
        data: JSON.parse(JSON.stringify(listOfUsers)),
      };
    } else {
      return {
        success: false,
        message: "Some error occured! Please try again",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Some error occured! Please try again",
    };
  }
}

//edit a user action
export async function editUserAction(
  currentUserID,
  formData,
  pathToRevalidate
) {
  await connectToDB();

  try {
    const { firstName, lastName, email, address } = formData;

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: currentUserID,
      },
      { firstName, email, lastName, address },
      { new: true }
    );
    if (updatedUser) {
      // Wrap revalidatePath in try-catch to handle test environment errors
      try {
        revalidatePath(pathToRevalidate);
      } catch (revalidateError) {
        // Silently ignore revalidatePath errors in test environment
        // This is expected when running integration tests
        if (!process.env.MONGO_URI_TEST) {
          throw revalidateError;
        }
      }
      return {
        success: true,
        message: "User updated successfully",
      };
    } else {
      return {
        success: false,
        message: "Not able to update the user! Please try again",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Some error occured! Please try again",
    };
  }
}

//delete a user action

export async function deleteUserAction(currentUserID, pathToRevalidate) {
  await connectToDB();
  try {
    const deletedUser = await User.findByIdAndDelete(currentUserID);

    if (deletedUser) {
      // Wrap revalidatePath in try-catch to handle test environment errors
      try {
        revalidatePath(pathToRevalidate);
      } catch (revalidateError) {
        // Silently ignore revalidatePath errors in test environment
        // This is expected when running integration tests
        if (!process.env.MONGO_URI_TEST) {
          throw revalidateError;
        }
      }
      return {
        success: true,
        message: "User deleted successfully",
      };
    } else {
      return {
        success: false,
        message: "Not able perform delete operation! Please try again later",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Some error occured! Please try again",
    };
  }
}
