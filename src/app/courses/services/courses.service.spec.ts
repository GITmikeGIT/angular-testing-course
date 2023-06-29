import { HttpErrorResponse } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Course } from "../model/course";
import {
  COURSES,
  findCourseById,
  findLessonsForCourse,
} from "./../../../../server/db-data";
import { CoursesService } from "./courses.service";
describe("CoursesService", () => {
  let coursesService: CoursesService,
    httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoursesService],
    });
    coursesService = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it("should retrieve all courses", () => {
    coursesService.findAllCourses().subscribe((courses) => {
      expect(courses).toBeTruthy("No courses returned");
      expect(courses.length).toBe(12, "incorrect number of courses returned");
      const course = courses.find((course) => course.id === 12);
      expect(course.titles.description).toBe("Angular Testing Course");
    });
    const request = httpTestingController.expectOne("/api/courses");
    expect(request.request.method).toEqual("GET");

    request.flush({ payload: Object.values(COURSES) });
  });

  it("should find a course by id", () => {
    const mockCourse: any = Object.values(COURSES).find(
      (course: any) => course.id === 1
    );
    coursesService.findCourseById(mockCourse.id).subscribe((course) => {
      expect(course).toBeTruthy("Not found course");
      expect(course.id).toBe(mockCourse.id, "Wrong course retrieved");
    });

    const request = httpTestingController.expectOne(
      `/api/courses/${mockCourse.id}`
    );
    expect(request.request.method).toEqual("GET");

    request.flush(mockCourse);
  });

  it("should save the course data", () => {
    const mockCourse: any = findCourseById(12);
    const changes = {
      titles: { ...mockCourse.titles, description: "new title" },
    };
    coursesService.saveCourse(mockCourse.id, changes).subscribe((course) => {
      expect(course.id).toBe(mockCourse.id, "Id was changed unfortunately.");
      expect(course.titles.description).toBe(
        "new title",
        "Title description was not changed"
      );
    });

    const request = httpTestingController.expectOne(
      `/api/courses/${mockCourse.id}`
    );
    expect(request.request.method).toEqual("PUT");
    expect(request.request.body.titles.description).toEqual(
      changes.titles.description
    );
    request.flush({ ...mockCourse, ...changes });
  });

  it("should give an error if saveCourse failed", () => {
    const mockCourse: any = findCourseById(12);
    const changes: Partial<Course> = {
      titles: { ...mockCourse.titles, description: "new title" },
    };
    coursesService.saveCourse(mockCourse.id, changes).subscribe(
      () => fail("save course method should have been failed"),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      }
    );

    const request = httpTestingController.expectOne(
      `/api/courses/${mockCourse.id}`
    );
    expect(request.request.method).toBe("PUT");
    request.flush("Save course failed", {
      status: 500,
      statusText: "Internal Server Error",
    });
  });

  it("should find a list of lessons", () => {
    const mockCourse: any = findCourseById(12);
    coursesService.findLessons(mockCourse.id).subscribe((lessons) => {
      expect(lessons).toBeTruthy();
      expect(lessons.length).toBe(10);
    });

    const request = httpTestingController.expectOne(
      (req) => req.url === "/api/lessons"
    );

    expect(request.request.method).toBe("GET");
    expect(request.request.params.get("courseId")).toEqual(`${mockCourse.id}`);
    expect(request.request.params.get("filter")).toEqual("");
    expect(request.request.params.get("sortOrder")).toEqual("asc");
    expect(request.request.params.get("pageNumber")).toEqual("0");
    expect(request.request.params.get("pageSize")).toEqual("3");

    request.flush({
      payload: findLessonsForCourse(mockCourse.id),
    });
  });

  afterEach(() => {
    httpTestingController.verify();
  });
});
