/**
 * @jest-environment jsdom
 */

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
      document.body.innerHTML = NewBillsUI();

      const inputDate = screen.getByTestId("datepicker");
      fireEvent.change(inputDate, { target: { value: "2004-04-04" } });
      expect(inputDate.value).toBe("2004-04-04");

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: "380" } });
      expect(inputAmount.value).toBe("380");

      const inputPCT = screen.getByTestId("pct");
      fireEvent.change(inputPCT, { target: { value: "80" } });
      expect(inputPCT.value).toBe("80");

      const img = new File(["img"], "image.png", { type: "image/png" });
      const inputFile = screen.getByTestId("file");
      userEvent.upload(inputFile, img);
      expect(img.name).toBe("image.png");
      expect(inputFile.files[0]).toBeTruthy();

      const form = screen.getByTestId("form-new-bill");

      // localStorage should be populated with form data
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }

      const store = null;

      const newBillPage = new NewBill({ 
        document, onNavigate, store, localStorage: window.localStorage  
      });

      const handleSubmit = jest.fn(newBillPage.handleSubmit);
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    })
  })
  describe('When I do not fill the form and I click on send bill button', () => {
    test(('Then, I should stay on new bill page'), () => {
      document.body.innerHTML = NewBillsUI();

      const inputDate = screen.getByTestId("datepicker");
      expect(inputDate.value).toBe("");

      const inputAmount = screen.getByTestId("amount");
      expect(inputAmount.value).toBe("");

      const inputPCT = screen.getByTestId("pct");
      expect(inputPCT.value).toBe("");

      const inputFile = screen.getByTestId("file");
      expect(inputFile.value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })
  })
})



/**
 * Test of the POST method
 */
describe("Given I am a user connected as an employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getAllByText("Envoyer une note de frais"))
      expect(screen.getAllByTestId("form-new-bill")).toBeTruthy()
      /*window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByTestId("tbody")).toBeTruthy()*/
    //})
  })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
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
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update : (bill) =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          update : (bill) =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})