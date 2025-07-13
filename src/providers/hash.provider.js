import bcrypt from 'bcrypt'

const hashProvider = {
  async generateHash(password) {
    return await bcrypt.hash(password, 10)
  },
}

export default hashProvider
