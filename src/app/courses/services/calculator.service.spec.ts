import { TestBed } from "@angular/core/testing";
import { CalculatorService } from "./calculator.service";
import { LoggerService } from "./logger.service";

describe("Calculator Service", () => {
  let loggerSpy: any;
  let calculator: CalculatorService;
  beforeEach(() => {
    loggerSpy = jasmine.createSpyObj("LoggerService", ["log"]);
    loggerSpy.log.and.returnValue("Done logging");
    TestBed.configureTestingModule({
      providers: [
        CalculatorService,
        { provide: LoggerService, useValue: loggerSpy },
      ],
    });
    calculator = TestBed.inject(CalculatorService);
  });

  it("should add two numbers", () => {
    expect(calculator.add(1, 2)).toEqual(3);
    expect(loggerSpy.log).toHaveBeenCalledTimes(1);
  });

  it("should subtract two numbers", () => {
    expect(calculator.subtract(6, 3)).toEqual(3);
    expect(loggerSpy.log).toHaveBeenCalledTimes(1);
  });
});
