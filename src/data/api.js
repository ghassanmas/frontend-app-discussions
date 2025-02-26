/* eslint-disable import/prefer-default-export */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { API_BASE_URL } from './constants';

export const blocksAPIURL = `${API_BASE_URL}/api/courses/v1/blocks/`;
export async function getCourseBlocks(courseId, username) {
  const params = {
    course_id: courseId,
    username,
    depth: 'all',
    requested_fields: 'children',
    block_types_filter: 'course,chapter,sequential,vertical,discussion',
    student_view_data: 'discussion',
  };
  const { data } = await getAuthenticatedHttpClient()
    .get(blocksAPIURL, { params });
  return data;
}
