import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"


export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  /**
   * I have created this function to select the good file format
   * @param {Object} target
   * @returns {boolean}
   * This function also displays a message under the input
   */
  handleFileType({target}){
    const file = target.files[0];
    const fileName = file.name;
    const fileNameArray = fileName.split('.')
    const fileNameFormat = fileNameArray[1]?.toLowerCase()
    target.setCustomValidity("")
    if(fileNameFormat === 'jpeg' || fileNameFormat === 'jpg' || fileNameFormat === 'png') {
      return true
    }
    target.setCustomValidity("Formats acceptés : jpg, jpeg et png")
    target.reportValidity()
    // To avoid the title to be displayed on the input
    target.value = null
    return false
  }
  handleChangeFile = e => {
    e.preventDefault()
    /** I have changed this line by the call of a new function handleFileType */
    //const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const isFileTypeValid = this.handleFileType(e)
    /** I have added a condition to execute the code only if the file format is correct */
    if(isFileTypeValid) {
      const filePath = e.target.value.split(/\\/g)
      const fileName = filePath[filePath.length-1]
      const formData = new FormData()
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', e.target.files[0])
      formData.append('email', email)
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
        }).catch(error => console.error(error))
    }
  }
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}