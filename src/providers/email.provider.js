import transporter from '../config/email.config.js'

const emailProvider = {
  async sendEmail({ emailFrom, emailTo, emailSubject, emailText }) {
    await transporter.sendMail({
      from: emailFrom,
      to: emailTo,
      subject: emailSubject,
      text: emailText,
    })
  },
}

export default emailProvider
