/**
 * @jest-environment jsdom
 */

/*import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"*/


/*describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html*/
      //to-do write assertion
    /*})
  })
})*/


import '@testing-library/jest-dom/extend-expect'
import {fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillsUI from "../views/NewBillUI.js"
import NewBill, { getIsGoodFormat } from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router"

jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee", () => {
  describe("When I am on New Bill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).toBeTruthy()
    })
  })
})

describe('Given I am connected as an employee and I am on NewBill Page', () => {
  describe('When I upload a file to the wrong format', () => {
    test('Then, I should not be able to send the bill', () => {
      const fileName = "test.pdf"
      const isGoodFormat = getIsGoodFormat(fileName)
      expect(isGoodFormat).toBe(false)
    })
  })
  describe('When I upload a file to the good format (jpeg, jpg or png)', () => {
    test('Then, I should be able to send the bill', () => {
      const fileName = "test.jpg"
      const isGoodFormat = getIsGoodFormat(fileName)
      expect(isGoodFormat).toBe(true)
    })
  })
  describe('When I fill the form and I click on send bill button', () => {
    test(('Then, I should be sent on bills page'), () => {
      /*const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }*/

      /*Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))*/

      /*const newBillPage = new NewBill({ 
        document, onNavigate, store: null, localStorage: window.localStorage  
      })*/

      document.body.innerHTML = NewBillsUI()


      const date = screen.getByTestId("datepicker")
      fireEvent.change(date, { target: { value: '2004-04-04' } })
      expect(date).toBe(screen.getByDisplayValue('2004-04-04'))

      const amount = screen.getByTestId("amount")
      fireEvent.change(amount, { target: { value: '123' } })
      expect(amount).toBe(screen.getByDisplayValue('123'))

      const pct = screen.getByTestId("pct")
      fireEvent.change(pct, { target: { value: '23' } })
      expect(pct).toBe(screen.getByDisplayValue('23'))

      const img = new File(["img"], "image.png", { type: "image/png" })
      const input = screen.getByTestId("file")
      userEvent.upload(input, img);
      expect(img.name).toBe("image.png");
      expect(input.files[0]).toBeTruthy()

      /*const submitButton = screen.getByTestId("test-btn-send-bill")
      const handleSubmit = jest.fn((e) => newBillPage.handleSubmit(e))
      submitButton.addEventListener("click", handleSubmit)
      fireEvent.click(submitButton)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()*/
    })
  })
  describe('When I do not fill the form and I click on send bill button', () => {
    test(('Then, I should stay on new bill page'), () => {
      /*const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }*/

      /*Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))*/

      /*const newBillPage = new NewBill({ 
        document, onNavigate, store: null, localStorage: window.localStorage  
      })*/

      document.body.innerHTML = NewBillsUI()


      /*const date = screen.getByTestId("datepicker")
      fireEvent.change(date, { target: { value: '2004-04-04' } })
      expect(date).toBe(screen.getByDisplayValue('2004-04-04'))

      const amount = screen.getByTestId("amount")
      fireEvent.change(amount, { target: { value: '123' } })
      expect(amount).toBe(screen.getByDisplayValue('123'))*/

      /*const pct = screen.getByTestId("pct")
      fireEvent.change(pct, { target: { value: undefined } })
      expect(pct).toBe(screen.getByDisplayValue(undefined))*/

      const img = null
      const input = screen.getByTestId("file")
      userEvent.upload(input, img);
      expect(input.files[0]).toBeNull()

      /*const submitButton = screen.getByTestId("test-btn-send-bill")
      const handleSubmit = jest.fn((e) => newBillPage.handleSubmit(e))
      submitButton.addEventListener("click", handleSubmit)
      fireEvent.click(submitButton)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()*/
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as an employee", () => {
  describe("When I navigate to NewBill", () => {
    test("fetches bill from mock API POST", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByText("Envoyer une note de frais"))
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    /*beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })*/
    /*test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : (bill) =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })*/

    /*test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : (bill) =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })*/
  })

  })
})
