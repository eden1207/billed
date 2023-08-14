/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom/extend-expect'
import {fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBill from "../containers/NewBill.js"
import { ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router"

jest.mock("../app/store", () => mockStore);

/**
 * Function to execute the same code before each tests
 */
beforeAll(() => {
   Object.defineProperty(window, "localStorage", { value: localStorageMock });
   window.localStorage.setItem(
      "user",
      JSON.stringify({
         type: "Employee",
         email: "employee@test.tld",
         status: "connected",
      })
   );
   const root = document.createElement("div");
   root.setAttribute("id", "root");
   document.body.append(root);
   router();
   window.onNavigate(ROUTES_PATH.NewBill);
});

/**
 * Function to reboot the mocks data after each tests
 */
afterEach(() => {
   jest.clearAllMocks();
});


/**
 * Test to check if the email icon is highlighted when the class "active-icon" is called
 */
describe("Given I am connected as an employee", () => {
   describe("When I am on New Bill Page", () => {
      test("Then bill icon in vertical layout should be highlighted", async () => {
         await waitFor(() => screen.getByTestId("icon-mail"));
         const mailIcon = screen.getByTestId("icon-mail");
         await expect(mailIcon.classList.contains("active-icon")).toBe(true);
      });
   });
})

/**
 * Series of test to check if the New Bill form is working
 * First of all, I am checking if the form is working when I enter values in
 * each input.
 * Then, I am checking the file uploading as function of the file format
 * Finally, when I enter a valid bill, I am checking if I am redirected to the bills page 
 */
describe('Given I am connected as an employee and I am on NewBill Page', () => {
   describe("When I fill out the form", () => {
      test("Then I should be able to choose an option of the select menu", async () => {
         const inputSelect = screen.getByTestId("expense-type");
         userEvent.selectOptions(inputSelect, ["Restaurants et bars"]);
         await expect(inputSelect.value).toBe("Restaurants et bars");
      });

      test("Then I should be able to enter an expense name", async () => {
         const inputName = screen.getByTestId("expense-name");
         userEvent.type(inputName, "Vol Paris Londres");
         await expect(inputName.value).toBe("Vol Paris Londres");
      });

      test("Then I should be able to select a date", async () => {
         const inputDate = screen.getByTestId("datepicker");
         fireEvent.change(inputDate, { target: { value: "2004-04-04" } });
         await expect(inputDate.value).toBe("2004-04-04");
      });

      test("Then I should be able to enter an amount", async () => {
         const inputAmount = screen.getByTestId("amount");
         userEvent.type(inputAmount, "400");
         await expect(inputAmount.value).toBe("400");
      });

      test("Then I should be able to enter a VAT amount", async () => {
         const inputVATAmount = screen.getByTestId("vat");
         userEvent.type(inputVATAmount, "70");
         await expect(inputVATAmount.value).toBe("70");
      });

      test("Then I should be able to enter a VAT Pourcentage", async () => {
         const inputVATPourcentage = screen.getByTestId("pct");
         userEvent.type(inputVATPourcentage, "20");
         await expect(inputVATPourcentage.value).toBe("20");
      });

      test("Then I should be able to write a commentary", async () => {
         const inputCommentary = screen.getByTestId("commentary");
         userEvent.type(inputCommentary, "Ceci est un commentaire");
         await expect(inputCommentary.value).toBe("Ceci est un commentaire");
      });
   });

   describe("When I upload a file with a wrong format", () => {
      test("Then it should display an error message", async () => {
         const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
         const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
         const inputFile = screen.getByTestId("file");
         inputFile.addEventListener("change", handleChangeFile);
         fireEvent.change(inputFile, {
            target: {
               files: [new File(["fileTestPdf"], "test.pdf", { type: "application/pdf" })],
            },
         });
         await expect(handleChangeFile).toHaveBeenCalledTimes(1);
         await expect(inputFile.validationMessage).toBe("Formats acceptés : jpg, jpeg et png");
      });
   });

   describe("When I upload a file with a correct format (.jpeg, .jpg, .png)", () => {
      test("Then I upload a file with a correct extension and it should not display the error message", async () => {
         const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
         const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
         const inputFile = screen.getByTestId("file");
         inputFile.addEventListener("change", handleChangeFile);
         fireEvent.change(inputFile, {
            target: {
               files: [new File(["fileTestPng"], "test.png", { type: "image/png" })],
            },
         });
         await expect(handleChangeFile).toHaveBeenCalledTimes(1);
         await expect(inputFile.validationMessage).not.toBe("Formats acceptés : jpg, jpeg et png");
      });
   });

   describe("When I submit a valid bill", () => {
      test("Then it should render the Bill Page", async () => {
         const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });

         const validBill = {
            name: "Achat électronique",
            date: "2023-03-22",
            type: "IT et électronique",
            amount: "150",
            pct: "20",
            vat: "30",
            fileName: "test.png",
            fileUrl: "https://test.png",
         };

         const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

         document.querySelector('input[data-testid="expense-name"]').value = validBill.name;
         document.querySelector('input[data-testid="datepicker"]').value = validBill.date;
         document.querySelector('select[data-testid="expense-type"]').value = validBill.type;
         document.querySelector('input[data-testid="amount"]').value = validBill.amount;
         document.querySelector('input[data-testid="vat"]').value = validBill.vat;
         document.querySelector('input[data-testid="pct"]').value = validBill.pct;
         document.querySelector('textarea[data-testid="commentary"]').value = validBill.commentary;
         newBill.fileUrl = validBill.fileUrl;
         newBill.fileName = validBill.fileName;

         const submit = screen.getByTestId("form-new-bill");
         submit.addEventListener("click", handleSubmit);
         userEvent.click(submit);
         expect(handleSubmit).toHaveBeenCalledTimes(1);

         await expect(screen.findByText("Mes notes de frais")).toBeTruthy();
      });
   });
});


/**
 * Test of the POST method
 * The first test checks if I am able to post a bill.
 * Then I am checking if I receive a 404 and 500 error when the request is rejected
 */
describe("Given I am a user connected as an employee", () => {
   describe("When I am on newBill Page and I have sent the form", () => {
      test("Then it should create a new bill to mock API POST", async () => {
         Object.defineProperty(window, "localStorage", { value: localStorageMock });
         window.localStorage.setItem(
            "user",
            JSON.stringify({
               type: "Employee",
               email: "employee@test.tld",
               status: "connected",
            })
         );
         const root = document.createElement("div");
         root.setAttribute("id", "root");
         document.body.append(root);
         router();
         window.onNavigate(ROUTES_PATH.NewBill);

         const dataCreated = jest.spyOn(mockStore.bills(), "create");
         const bill = {
            name: "Achat électronique",
            date: "2023-03-22",
            type: "IT et électronique",
            amount: "150",
            pct: "20",
            vat: "30",
            fileName: "test.png",
            fileUrl: "https://test.png",
            commentary: "Test bill for spying create function",
         };
         const result = await mockStore.bills().create(bill);

         expect(dataCreated).toHaveBeenCalled();
         expect(result).toEqual({ fileUrl: "https://localhost:3456/images/test.jpg", key: "1234" });
      });
      describe("When an error occurs on API", () => {
         beforeEach(() => {
            jest.spyOn(mockStore, "bills");
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            window.localStorage.setItem(
               "user",
               JSON.stringify({
                  type: "Employee",
                  email: "employee@test.tld",
                  status: "connected",
               })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            router();
         });
         afterEach(() => {
            jest.clearAllMocks();
         });
         test("Then sends new bill to the API and fails with 404 message error", async () => {
            const error = new Error("Erreur 404");
            mockStore.bills.mockImplementationOnce(() => {
               return {
                  create: () => {
                     return Promise.reject(new Error("Erreur 404"));
                  },
               };
            });

            window.onNavigate(ROUTES_PATH.NewBill);
            await new Promise(process.nextTick);
            await expect(mockStore.bills().create({})).rejects.toEqual(error);
         });

         test("Then sends new bill to the API and fails with 500 message error", async () => {
            const error = new Error("Erreur 500");
            mockStore.bills.mockImplementationOnce(() => {
               return {
                  create: () => {
                     return Promise.reject(new Error("Erreur 500"));
                  },
               };
            });

            window.onNavigate(ROUTES_PATH.NewBill);
            await new Promise(process.nextTick);
            await expect(mockStore.bills().create({})).rejects.toEqual(error);
         });

      });
   });
});