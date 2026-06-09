import { ServerConnection } from '@jupyterlab/services';
import { URLExt } from '@jupyterlab/coreutils';
import { INbGraderAssignment } from '../model/nbgrader';
import { IE2xGraderSubmissionResponse } from '../model/e2xgrader';

export namespace AssignmentListAPI {
  export const COURSE_API_PATH = 'courses';
  export const ASSIGNMENT_API_PATH = 'assignments';
  export const SUBMIT_NOTEBOOK_API_PATH = 'assignments/submit';

  export async function fetchCourses(): Promise<string[]> {
    const settings = ServerConnection.makeSettings();
    const requestUrl = URLExt.join(settings.baseUrl, COURSE_API_PATH);

    return ServerConnection.makeRequest(requestUrl, {}, settings)
      .then(async response => {
        return (await response.json()).value;
      })
      .catch(error => {
        throw new ServerConnection.NetworkError(error as TypeError);
      });
  }

  export async function fetchAssignments(
    courseId: string
  ): Promise<INbGraderAssignment[]> {
    const settings = ServerConnection.makeSettings();
    const requestUrl = URLExt.join(
      settings.baseUrl,
      ASSIGNMENT_API_PATH,
      '?course_id=' + encodeURIComponent(courseId)
    );

    return ServerConnection.makeRequest(requestUrl, {}, settings)
      .then(async response => {
        return (await response.json()).value;
      })
      .catch(error => {
        throw new ServerConnection.NetworkError(error as TypeError);
      });
  }

  export async function submitAssignment(
    courseId: string,
    assignmentId: string
  ): Promise<IE2xGraderSubmissionResponse> {
    const settings = ServerConnection.makeSettings();
    const requestUrl = URLExt.join(settings.baseUrl, SUBMIT_NOTEBOOK_API_PATH);

    return ServerConnection.makeRequest(
      requestUrl,
      {
        method: 'POST',
        body: JSON.stringify({
          course_id: courseId,
          assignment_id: assignmentId
        })
      },
      settings
    ).then(response => {
      if (response.status === 200) {
        response.json();
      }
      throw new Error('Failed to submit assignment!');
    });
  }
}
