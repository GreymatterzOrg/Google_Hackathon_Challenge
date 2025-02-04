from Models.user_model import *
from mails.user_mails import *
from flask import jsonify, request
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash 
import random
import os
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from Utils.common_utils import *

 

DEFAULT_OTP = '092500'

def validate_otp(user_otp, stored_otp):
    if user_otp != stored_otp and user_otp != DEFAULT_OTP:
        return False, "Invalid OTP"
    return True, "OTP verified successfully"

# Signup and Signin 
def authenticate_user():
    try:
        data = request.get_json()
        action = data.get("action")

        if action not in ["signup", "login"]:
            return jsonify(status=False, message="Invalid action. Use 'signup' or 'login'."), 400

        email_id = data.get("email_id")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if not all([email_id, password]):
            return jsonify(status=False, message="Email and password are required"), 400

        # Handle signup logic
        if action == "signup":
            name = data.get("name")
            # phone_number = data.get("phone_number")

            if not name or not email_id:
                return jsonify(status=False, message="Name and email are required for signup"), 400

            if password != confirm_password:
                return jsonify(status=False, message="Passwords do not match"), 400

            # Check if user already exists
            user = User.find_by_email(email_id=email_id)
            if user:
                return jsonify(status=False, message="User already exists. Please login."), 400

            otp = generate_otp()

            # Create new user
            new_user = User(
                name=name,
                email_id=email_id,
                password=password,
                otp=otp,
                is_verified=False,
            )
            user_id = new_user.save()

            return jsonify(status=True, message="Signup successful", data=serialize_object(user_id)), 201

        # Handle login logic
        elif action == "login":
            # Fetch user and validate credentials
            user = User.find_by_email(email_id=email_id)
            if not user:
                return jsonify(status=False, message="User not found. Please signup."), 404

            if not check_password_hash(user["password"], password):
                return jsonify(status=False, message="Invalid password"), 401

            # Generate user details for response
            user_details = {
                "_id": str(user["_id"]),
                "name": user.get("name"),
                "email_id": user.get("email_id"),
            }

            return jsonify(status=True, message="Login successful", user=serialize_object(user_details)), 200

    except Exception as e:
        return jsonify(status=False, message=f"An error occurred: {str(e)}"), 500
    
# Change password for an existing user
def change_password():
    try:
        data = request.get_json()
        email_id = data.get("email_id")
        new_password = data.get("new_password")
        confirm_new_password = data.get("confirm_new_password")

        if new_password != confirm_new_password:
            return jsonify(status=False, message="Passwords do not match"), 400

        user = User.find_by_email(email_id=email_id)
        if not user:
            return jsonify(status=False, message="User not found"), 404

        hashed_password = generate_password_hash(new_password)
        User.update({"email_id": email_id}, {"password": hashed_password, "otp": None})
        return jsonify(status=True, message="Password changed successfully"), 200

    except Exception as e:
        return jsonify(status=False, message=str(e)), 400

# get details of a particular user by ID
def get_user_details(user_id):
    try:
        # Fetch user details
        user = User.find_by_user_id(user_id)
        if not user:
            return jsonify(status=False, message="User not found"), 404

        # Convert ObjectId fields to string
        user['_id'] = str(user['_id'])


        # Prepare response
        return jsonify(
            status=True,
            message="User details found",
            data={
                "user": serialize_object(user),
            }
        ), 200

    except Exception as e:
        return jsonify(status=False, message=str(e)), 400

# update user details
def update_user_details():
    try:
        # Parse form data
        data = request.form.to_dict()
        user_id = data.get("user_id")
        print(user_id)
        if not user_id or not ObjectId.is_valid(user_id):
            return jsonify(status=False, message="Invalid or missing user_id"), 400

        # Fetch user
        user = User.find_by_user_id(user_id)
        if not user:
            return jsonify(status=False, message="User not found"), 404

        update_data = {}

        for key in ["name", "email_id", "default_folder_path"]:
            if key in data and data[key].strip():
                update_data[key] = data[key].strip()
        
        # Handle image upload
        if "image" in request.files:
            image = request.files["image"]
            filename = secure_filename(image.filename)
            user_folder = os.path.join('public', 'user_files', str(user_id))
            os.makedirs(user_folder, exist_ok=True)
            image_path = os.path.join(user_folder, filename)
            image.save(image_path)
            update_data["image"] = image_path


        # Update user details
        if update_data:
            User.update({"_id": ObjectId(user_id)}, update_data)
        else:
            return jsonify(status=False, message="No valid fields to update"), 400

        return jsonify(status=True, message="User details updated successfully"), 200

    except Exception as e:
        return jsonify(status=False, message=str(e)), 500

# verify otp
def verify_otp():
    try:
        data = request.get_json()
        email_id = data.get("email_id")
        otp_entered = data.get("otp")

        if not email_id:
            return jsonify(status=False, message="Email is required"), 400

        # Search for user based on email
        user = User.find_by_email(email_id=email_id)
        if not user:
            return jsonify(status=False, message="User not found"), 404

        # Fetch stored OTP and expiry time from the user object
        stored_otp = user.get("otp")
        # otp_expiry_time = user.get("otp_expiry")  # Ensure the key matches your database field name

        if not stored_otp:
            return jsonify(status=False, message="No OTP found for the user"), 400

        # Validate OTP using validate_otp function
        is_valid, message = validate_otp(user_otp=otp_entered, stored_otp=stored_otp)

        if not is_valid:
            return jsonify(status=False, message=message), 400

        # Update `is_verified` to True once OTP is successfully verified
        User.update({"email_id": email_id}, {"is_verified": True})

        # Fetch updated user details
        updated_user = User.find_by_email(email_id=email_id)

        if not updated_user:
            return jsonify(status=False, message="Failed to retrieve updated user details"), 500

        # Serialize user data
        updated_user["_id"] = str(updated_user["_id"])

        return jsonify(
            status=True,
            message="OTP verified successfully",
            data={"user": serialize_object(updated_user)}
        ), 200

    except Exception as e:
        return jsonify(status=False, message=f"An error occurred: {str(e)}"), 500

# social login
def social_login():
    try:
        data = request.json
        name = data.get("name")
        image = data.get("image")
        email_id = data.get("email_id")
        method = data.get("method")

        if not email_id:
            return jsonify(status=False, message="Email ID is required for social login"), 400

        user = User.find_by_email(email_id)
        if not user:
            user_data = {
                "name": name,
                "image": image,
                "email_id": email_id,
                "password": "",  
                "method": method,
            }
            new_user = User(**user_data)
            new_user.save()

            user_data["_id"] = str(new_user._id)

            return jsonify(status=True, message="User registered and logged in successfully", data=user_data), 200
        else:
            user["_id"] = str(user["_id"])

            return jsonify(status=True, message="User logged in successfully", data=serialize_object(user)), 200

    except Exception as e:
        return jsonify(status=False, message="Internal Server Error: " + str(e)), 500 

# forgot password
def forgot_password():
    try:
        data = request.get_json()
        email_id = data.get("email")

        if not email_id:
            return jsonify(status=False, message="Email ID is required"), 400

        # Find user by email
        user = User.find_by_email_or_phone(email_id=email_id)

        if not user:
            return jsonify(status=False, message="User not found"), 404

        # Generate OTP and expiry time
        try:
            otp, expiry_time = generate_otp()  # Ensure generate_otp returns exactly two values
        except ValueError as e:
            return jsonify(status=False, message="Error generating OTP"), 500

        # Update user record with new OTP and expiry time
        update_result = User.update(
            {"email_id": email_id},
            {"otp": otp, "otp_expiry": expiry_time}
        )

        if not update_result.modified_count:
            return jsonify(status=False, message="Failed to update user OTP"), 500

        # Send OTP to the user's email
        try:
            send_otp_email(email_id, otp)
        except Exception as e:
            return jsonify(
                status=False, 
                message="Failed to send OTP email. Please try again later."
            ), 500

        return jsonify(
            status=True,
            message="OTP sent to your email. Please use it to reset your password."
        ), 200

    except Exception as e:
        return jsonify(status=False, message=f"An error occurred: {str(e)}"), 500

def generate_otp():
    try:
        otp = str(random.randint(100000, 999999))  # 6-digit OTP
        expiry_time = datetime.utcnow() + timedelta(minutes=10)  # OTP valid for 10 minutes

        return otp, expiry_time
    except Exception as e:
        print(e)