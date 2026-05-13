export const InvitationMailTemplate = ({ developerName, projectName, acceptLink, expiresIn = "24 hours" }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Invitation</title>
        <style> 
        .body{
        margin: 40px;
        color: #333;
        }
        .highlight{
        font-weight: bold;
        color: #1e293b;
        }
        .btn-wraper{
        margin:20px 0;
        }
        .btn{
        text-decoration:none;
        padding:10px 20px;
        background-color:#1e293b;
        color:#fff;
        border-radius:5px;
        }
        .expiry{
        color:#64748b;
        font-size:14px;
        }
        </style>
    </head>
    <body>
        <div class="body">
            <p>Hi <span class="highlight">${developerName}</span>,</p>
            <p>
                You have been invited to join the project 
                <span class="highlight">"${projectName}"</span>. 
                Click the button below to accept the invitation.
           </p>
          <div class="btn-wrapper">
            <a href="${acceptLink}" class="btn">Accept Invitation</a>
          </div>
          <p class="expiry">This invitation will expire in ${expiresIn}.</p>
          </div>
    </body>
    </html>
    `
}