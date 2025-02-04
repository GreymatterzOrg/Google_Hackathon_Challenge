import os
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from Models.user_model import *
sender_email = os.getenv("SENDER_EMAIL")
# sender_password = os.getenv("SENDER_PASSWORD")
sender_password = 'qenp pnic rnag zalj'
smtp_server = os.getenv("SMTP_SERVER")
smtp_port = os.getenv("SMTP_PORT")


# send otp e-mail
def send_otp_email(email_id, otp):


    # Create message container
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = email_id
    msg["Subject"] = "OTP"

    html_body = f"""
    <html>
    <head>
    <meta charset="utf-8">
    <title>LLM</title>
    </head>
    
    <body style="margin: 0;padding: 0; font-family:'Arial', sans-serif; font-size:16px; color:#000; line-height:22px;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0;padding:0; font-family:'Arial', sans-serif; border-collapse: collapse;">
      <tbody>
        <tr>
          <td align="center"><table width="414" border="0" cellspacing="0" cellpadding="0" style="background:#F4F5F9; border-collapse:collapse;">
              <tbody>
                <tr>
                  <td align="center" valign="middle" style="background:#FFF; height:15px;"></td>
                </tr>
                <tr>
                  <td align="center" valign="middle" style="background:#FFF;"><img src=""></td>
                </tr>
                <tr><td align="center" valign="middle" style="background:#FFF; height:5px;"></td></tr>
                <tr><td align="center" valign="middle" style="background:#F4F5F9;height: 20px"></td></tr>
                <tr>
                  <td align="center" valign="top"><table width="380" border="0" cellspacing="0" cellpadding="0" style="background:#FFF; border:1px solid rgba(104,245,255,0.5); border-collapse:collapse;">
                      <tr>
                        <td align="center" valign="middle">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="center" valign="middle">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="center" valign="middle" alt = "lock"><img src="images/lock.png"></td>
                      </tr>
    
                      <tr>
                        <td align="center" valign="middle">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style="background:#FFF; height:10px;"></td>
                      </tr>
                      <tr>
                        <td style="color:#000; font-size:15px; font-family:'Arial', sans-serif; padding:0 12px;">Use the below otp to reset your password!</td>
                      </tr>
                      <tr>
                        <td align="center" valign="middle">&nbsp;</td>
                      </tr>
                       <tr>
                        <td align="left" valign="middle" style="color:#000; font-size:15px; font-family:'Arial', sans-serif; padding:0 12px;">
                Please use the OTP below to complete your email verification:
              </td>
                      </tr>
                      <tr>
                        <td align="center" valign="middle">&nbsp;</td>
                      </tr>
              <tr>
                        <td align="left" valign="middle" style="padding-left: 12px;">
                <table width="150" border="0" cellspacing="0" cellpadding="0" style="background: #F2F2F2; width:150px">
                  <tbody>
                  <tr>
                    <td width="50px" style="padding:15px 10px;font-weight: bold;font-size:32px;letter-spacing:10px; font-family:'Arial', sans-serif;">{otp}</td>
                  </tr>
                  </tbody>
                </table>
    
              </td>
                <td align="center" valign="middle">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top: 20px;"><table border="0" cellspacing="0" cellpadding="0" style="width: 300px;">
                            <tr>
                              <td colspan="2" style="font-size:15px; font-family:'Arial', sans-serif; padding-bottom:20px;"></td>
                            </tr>
                           </table>
              </td>
                      </tr>
                    </table>
          </td>
                </tr>
                <tr>
             <td colspan="2" style="height:10px;"></td>
          </tr>
            <tr>
             <td colspan="2" style="height:10px;"></td>
          </tr>
                <tr>
                  <td align="center" valign="middle"><table width="374" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td><table>
                            <tr>
                              <td style="color:#000; font-size:15px; font-family:'Arial', sans-serif;">Best Regards,</td>
                            </tr>
                            <tr>
                              <td style="color:#000; font-size:18px; font-weight:bold; font-family:'Arial', sans-serif;">Team ChirpChat</td>
                            </tr>
                          </table></td>
                        <td align="right"><table>
                            <tr>
                            <td><a href="https://www.facebook.com/"><img src="images/fb.png"></a></td>
                            <td><a href="https://www.linkedin.com/"><img src="images/linked.png"></a></td>
                            <td><a href="https://twitter.com/"><img src="images/twitter.png"></a></td>
                            </tr>
                          </table></td>
                      </tr>
                    </table></td>
                </tr>
                <tr>
                  <td height="10"></td>
                </tr>
              </tbody>
            </table></td>
        </tr>
      </tbody>
    </table>
    </body>
    </html>
    """

    # Attach HTML message
    msg.attach(MIMEText(html_body, "html"))

    # Create SMTP session
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    server.login(sender_email, sender_password)

    # Send email
    server.sendmail(sender_email, email_id, msg.as_string())
    server.quit()


# # send new user mail
# def send_invite_email(email, company_name, invited_by_name, invite_link):
#     try:
#         if not email:
#             raise ValueError("Email address is None or invalid")
#         # Create message container
#         msg = MIMEMultipart()
#         msg["From"] = sender_email
#         msg["To"] = email
#         msg["Subject"] = "New User Invite Mail"
#         html_body = f"""
#         <html>
#         <head>
#         <meta charset="utf-8">
#         <title>Invite Email</title>
#         <style>
#             .button {{
#                 background-color: #4CAF50; /* Green */
#                 border: none;
#                 color: white;
#                 padding: 15px 32px;
#                 text-align: center;
#                 text-decoration: none;
#                 display: inline-block;
#                 font-size: 16px;
#                 margin: 4px 2px;
#                 cursor: pointer;
#             }}
#         </style>
#         </head>
#         <body style="margin: 0;padding: 0; font-family:'Arial', sans-serif; font-size:16px; color:#000; line-height:22px;">
#         <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0;padding:0; font-family:'Arial', sans-serif; border-collapse: collapse;">
#           <tbody>
#             <tr>
#               <td align="center"><table width="414" border="0" cellspacing="0" cellpadding="0" style="background:#F4F5F9; border-collapse:collapse;">
#                   <tbody>
#                     <tr>
#                       <td align="center" valign="middle" style="background:#FFF; height:15px;"></td>
#                     </tr>
#                     <tr>
#                       <td align="center" valign="middle" style="background:#FFF;"><img src=""></td>
#                     </tr>
#                     <tr><td align="center" valign="middle" style="background:#FFF; height:5px;"></td></tr>
#                     <tr><td align="center" valign="middle" style="background:#F4F5F9;height: 20px"></td></tr>
#                     <tr>
#                       <td align="center" valign="top"><table width="380" border="0" cellspacing="0" cellpadding="0" style="background:#FFF; border:1px solid rgba(104,245,255,0.5); border-collapse:collapse;">
#                           <tr>
#                             <td align="center" valign="middle">&nbsp;</td>
#                           </tr>
#                           <tr>
#                             <td align="center" valign="middle">&nbsp;</td>
#                           </tr>
#                           <tr>
#                             <td align="center" valign="middle" alt="lock"><img src="images/lock.png"></td>
#                           </tr>
#                           <tr>
#                             <td align="center" valign="middle">&nbsp;</td>
#                           </tr>
#                           <tr>
#                             <td style="color:#000; font-size:18px; font-family:'Arial', sans-serif; padding:0 12px;">You have been invited to join {company_name} by {invited_by_name}</b></td>
#                           </tr>
#                           <tr>
#                             <td style="background:#FFF; height:10px;"></td>
#                           </tr>
#                           <tr>
#                           </tr>
#                           <tr>
#                             <td align="center" valign="middle">&nbsp;</td>
#                           </tr>
#                           <tr>
#                             <td align="left" valign="middle" style="color:#000; font-size:15px; font-family:'Arial', sans-serif; padding:0 12px;">
#                                 Please accept the invite link by clicking the button below.
#                             </td>
#                           </tr>
#                           <tr>
#                             <td align="center" valign="middle">&nbsp;</td>
#                           </tr>
#                           <tr>
#                             <td align="center" valign="middle">
#                                 <a href={invite_link} class="button">Accept Invite</a>
#                             </td>
#                           </tr>
#                           <tr>
#                             <td align="center" valign="middle">&nbsp;</td>
#                           </tr>
#                           <tr>
#                             <td align="center" style="padding-top: 20px;"><table border="0" cellspacing="0" cellpadding="0" style="width: 300px;">
#                                 <tr>
#                                   <td colspan="2" style="font-size:15px; font-family:'Arial', sans-serif; padding-bottom:20px;"></td>
#                                 </tr>
#                               </table>
#                             </td>
#                           </tr>
#                         </table>
#                       </td>
#                     </tr>
#                     <tr>
#                       <td height="10"></td>
#                     </tr>
#                   </tbody>
#                 </table>
#               </td>
#             </tr>
#           </tbody>
#         </table>
#         <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0;padding:0; font-family:'Arial', sans-serif; border-collapse: collapse;">
#             <tbody>
#                 <tr>
#                     <td align="center" valign="middle"><table width="374" border="0" cellspacing="0" cellpadding="0">
#                         <tr>
#                             <td><table>
#                                 <tr>
#                                     <td style="color:#000; font-size:15px; font-family:'Arial', sans-serif;">Best Regards,</td>
#                                 </tr>
#                                 <tr>
#                                     <td style="color:#000; font-size:18px; font-weight:bold; font-family:'Arial', sans-serif;">Team VOIP</td>
#                                 </tr>
#                               </table></td>
#                             <td align="right"><table>
#                                 <tr>
#                                     <td><a href="https://www.facebook.com/"><img src="images/fb.png"></a></td>
#                                     <td><a href="https://www.linkedin.com/"><img src="images/linked.png"></a></td>
#                                     <td><a href="https://twitter.com/"><img src="images/twitter.png"></a></td>
#                                 </tr>
#                               </table></td>
#                           </tr>
#                       </table></td>
#                   </tr>
#               </tbody>
#           </table>
#         </body>
#         </html>
#         """

#         # Attach HTML message
#         msg.attach(MIMEText(html_body, "html"))

#         # Create SMTP session
#         server = smtplib.SMTP(smtp_server, smtp_port)
#         server.starttls()
#         server.login(sender_email, sender_password)

#         # Send email
#         server.sendmail(sender_email, email, msg.as_string())
#         server.quit()
#         return True

#     except Exception as e:
#         return False

# # send existing user mail
# def send_existing_user_email(email, company_name, invited_by_name, invite_existing_link):
    # try:
    #     if not email:
    #         raise ValueError("Email address is None or invalid")
    #     msg = MIMEMultipart()
    #     msg["From"] = sender_email
    #     msg["To"] = email
    #     msg["Subject"] = " Existing User Invite Mail"
    #     html_body = f"""
    #     <html>
    #     <head>
    #     <meta charset="utf-8">
    #     <title>LLM</title>
    #     </head>
    #     <body style="margin: 0;padding: 0; font-family:'Arial', sans-serif; font-size:16px; color:#000; line-height:22px;">
    #     <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0;padding:0; font-family:'Arial', sans-serif; border-collapse: collapse;">
    #       <tbody>
    #         <tr>
    #           <td align="center"><table width="414" border="0" cellspacing="0" cellpadding="0" style="background:#F4F5F9; border-collapse:collapse;">
    #               <tbody>
    #                 <tr>
    #                   <td align="center" valign="middle" style="background:#FFF; height:15px;"></td>
    #                 </tr>
    #                 <tr>
    #                   <td align="center" valign="middle" style="background:#FFF;"><img src=""></td>
    #                 </tr>
    #                 <tr><td align="center" valign="middle" style="background:#FFF; height:5px;"></td></tr>
    #                 <tr><td align="center" valign="middle" style="background:#F4F5F9;height: 20px"></td></tr>
    #                 <tr>
    #                   <td align="center" valign="top"><table width="380" border="0" cellspacing="0" cellpadding="0" style="background:#FFF; border:1px solid rgba(104,245,255,0.5); border-collapse:collapse;">
    #                       <tr>
    #                         <td align="center" valign="middle">&nbsp;</td>
    #                       </tr>
    #                       <tr>
    #                         <td align="center" valign="middle">&nbsp;</td>
    #                       </tr>
    #                       <tr>
    #                         <td align="center" valign="middle" alt = "lock"><img src="images/lock.png"></td>
    #                       </tr>
    #                       <tr>
    #                         <td align="center" valign="middle">&nbsp;</td>
    #                       </tr>
    #                       <tr>
    #                         <td style="color:#000; font-size:18px; font-family:'Arial', sans-serif; padding:0 12px;">You have been invited to join {company_name} by {invited_by_name}</b></td>
    #                       </tr>
    #                       <tr>
    #                         <td style="background:#FFF; height:10px;"></td>
    #                       </tr>
    #                       <tr>
    #                       </tr>
    #                       <tr>
    #                         <td align="center" valign="middle">&nbsp;</td>
    #                       </tr>
    #                       <tr>
    #                         <td align="center" valign="middle">
    #                             <a href={invite_existing_link} class="button">Accept Invite</a>
    #                         </td>
    #                       </tr>
    #                       <tr>
    #                         <td align="center" valign="middle">&nbsp;</td>
    #                       </tr>
    #               <tr>
    #                         <td align="left" valign="middle" style="padding-left: 12px;">
    #                 <table width="150" border="0" cellspacing="0" cellpadding="0" style="background: #F2F2F2; width:150px">
    #                   <tbody>
    #                   <tr>
    #                     <td width="50px" style="padding:15px 10px;font-weight: bold;font-size:32px;letter-spacing:10px; font-family:'Arial', sans-serif;"><a href={invite_existing_link}>INVITE LINK</a></td>
    #                   </tr>
    #                   </tbody>
    #                 </table>
    #               </td>
    #                 <td align="center" valign="middle">&nbsp;</td>
    #                       </tr>
    #                       <tr>
    #                         <td align="center" style="padding-top: 20px;"><table border="0" cellspacing="0" cellpadding="0" style="width: 300px;">
    #                             <tr>
    #                               <td colspan="2" style="font-size:15px; font-family:'Arial', sans-serif; padding-bottom:20px;"></td>
    #                             </tr>
    #                           </table>
    #               </td>
    #                       </tr>
    #                     </table>
    #           </td>
    #                 </tr>
    #                 <tr>
    #             <td colspan="2" style="height:10px;"></td>
    #           </tr>
    #             <tr>
    #             <td colspan="2" style="height:10px;"></td>
    #           </tr>
    #                 <tr>
    #                   <td align="center" valign="middle"><table width="374" border="0" cellspacing="0" cellpadding="0">
    #                       <tr>
    #                         <td><table>
    #                             <tr>
    #                               <td style="color:#000; font-size:15px; font-family:'Arial', sans-serif;">Best Regards,</td>
    #                             </tr>
    #                             <tr>
    #                               <td style="color:#000; font-size:18px; font-weight:bold; font-family:'Arial', sans-serif;">Team VOIP</td>
    #                             </tr>
    #                           </table></td>
    #                         <td align="right"><table>
    #                             <tr>
    #                             <td><a href="https://www.facebook.com/"><img src="images/fb.png"></a></td>
    #                             <td><a href="https://www.linkedin.com/"><img src="images/linked.png"></a></td>
    #                             <td><a href="https://twitter.com/"><img src="images/twitter.png"></a></td>
    #                             </tr>
    #                           </table></td>
    #                       </tr>
    #                     </table></td>
    #                 </tr>
    #                 <tr>
    #                   <td height="10"></td>
    #                 </tr>
    #               </tbody>
    #             </table></td>
    #         </tr>
    #       </tbody>
    #     </table>
    #     </body>
    #     </html>
    #     """
    #    # Attach HTML message
    #     msg.attach(MIMEText(html_body, "html"))

    #     # Create SMTP session
    #     server = smtplib.SMTP(smtp_server, smtp_port)
    #     server.starttls()
    #     server.login(sender_email, sender_password)

    #     # Send email
    #     server.sendmail(sender_email, email, msg.as_string())
    #     server.quit()
    #     return True

    # except Exception as e:
    #     return False