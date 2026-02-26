module.exports = ({
  studentName,
  courseName,
  certificateId,
  issuedDate,
  courseDuration,
}) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: #f9fafb;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }

      .certificate {
        width: 900px;
        padding: 40px;
        border: 6px double #1976d2;
        background: linear-gradient(135deg, #ffffff, #f3f6fa);
        position: relative;
        text-align: center;
      }

      .corner {
        width: 50px;
        height: 50px;
        position: absolute;
        border-color: #0d47a1;
      }

      .top-left {
        top: 10px;
        left: 10px;
        border-top: 4px solid;
        border-left: 4px solid;
      }

      .top-right {
        top: 10px;
        right: 10px;
        border-top: 4px solid;
        border-right: 4px solid;
      }

      .bottom-left {
        bottom: 10px;
        left: 10px;
        border-bottom: 4px solid;
        border-left: 4px solid;
      }

      .bottom-right {
        bottom: 10px;
        right: 10px;
        border-bottom: 4px solid;
        border-right: 4px solid;
      }

      h1 {
        color: #1976d2;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 20px;
      }

      .student {
        font-size: 28px;
        font-weight: bold;
        margin: 15px 0;
      }

      .course {
        font-size: 22px;
        color: #0d47a1;
        font-weight: bold;
        margin: 15px 0;
      }

      .meta {
        font-size: 12px;
        color: #555;
        margin-top: 20px;
      }
    </style>
  </head>

  <body>
    <div class="certificate">

      <div class="corner top-left"></div>
      <div class="corner top-right"></div>
      <div class="corner bottom-left"></div>
      <div class="corner bottom-right"></div>

      <h1>Certificate of Completion</h1>

      <p>This is to certify that</p>

      <div class="student">${studentName}</div>

      <p>has successfully completed the course</p>

     <div class="course">${courseName}</div>

      ${
        courseDuration
          ? `<div style="margin-top:10px; font-size:18px; color:#333;">
              Duration: ${courseDuration}
            </div>`
          : ""
      }

      <div class="meta">
        Issued on ${issuedDate}
      </div>

    </div>
  </body>
  </html>
  `;
};
