/* eslint-disable import/prefer-default-export */
import { getIn } from 'formik';
import { generatePath, useRouteMatch } from 'react-router';

import {
  Delete, Edit, Flag, Pin, QuestionAnswer, VerifiedBadge,
} from '@edx/paragon/icons';

import { ContentActions, Routes, ThreadType } from '../data/constants';
import messages from './messages';

export function buildIntlSelectionList(options, intl, messagesData) {
  return Object.values(options)
    .map(
      option => (
        {
          label: intl.formatMessage(messagesData[option]),
          value: option,
        }
      ),
    );
}

/**
 * Get HTTP Error status from generic error.
 * @param error Generic caught error.
 * @returns {number|undefined}
 */
export const getHttpErrorStatus = error => error && error.customAttributes && error.customAttributes.httpErrorStatus;

/**
 * Return true if a field has been modified and is no longer valid
 * @param {string} field Name of field
 * @param {{}} errors formik error object
 * @param {{}} touched formik touched object
 * @returns {boolean}
 */
export function isFormikFieldInvalid(field, {
  errors,
  touched,
}) {
  return Boolean(getIn(touched, field) && getIn(errors, field));
}

/**
 * Hook to return the path for the current comments page
 * @returns {string}
 */
export function useCommentsPagePath() {
  const { params } = useRouteMatch(Routes.COMMENTS.PAGE);
  return Routes.COMMENTS.PAGES[params.page];
}

/**
 * Check if the provided comment or post supports the provided option.
 * @param {{editableFields:[string]}} content
 * @param {ContentActions} action
 * @returns {boolean}
 */
export function checkPermissions(content, action) {
  if (content.editableFields.includes(action)) {
    return true;
  }
  // For delete action we check `content.canDelete`
  if (action === ContentActions.DELETE) {
    return true;
  }
  return false;
}

/**
 * List of all possible actions for comments or posts.
 *
 * * `id` is a unique id for each action.
 * * `action` is the action being performed. One action can
 *    have multiple mutually-exclusive entries (such as close/open)..
 * * `icon` is the icon component to show for the action.
 * * `label` is the translatable label message that can be passed to intl.
 * * `conditions` is the an object where the key and value represent the key and value that should match
 *    in the content/post.
 *    e.g. for {pinned:false} the action will show up if the content/post has post.pinned==false
 */
export const ACTIONS_LIST = [
  {
    id: 'edit',
    action: ContentActions.EDIT_CONTENT,
    icon: Edit,
    label: messages.editAction,
  },
  {
    id: 'pin',
    action: ContentActions.PIN,
    icon: Pin,
    label: messages.pinAction,
    conditions: { pinned: false },
  },
  {
    id: 'unpin',
    action: ContentActions.PIN,
    icon: Pin,
    label: messages.unpinAction,
    conditions: { pinned: true },
  },
  {
    id: 'endorse',
    action: ContentActions.ENDORSE,
    icon: VerifiedBadge,
    label: messages.endorseAction,
    conditions: {
      endorsed: false,
      postType: ThreadType.DISCUSSION,
    },
  },
  {
    id: 'unendorse',
    action: ContentActions.ENDORSE,
    icon: VerifiedBadge,
    label: messages.unendorseAction,
    conditions: {
      endorsed: true,
      postType: ThreadType.DISCUSSION,
    },
  },
  {
    id: 'answer',
    action: ContentActions.ENDORSE,
    icon: VerifiedBadge,
    label: messages.markAnsweredAction,
    conditions: {
      endorsed: false,
      postType: ThreadType.QUESTION,
    },
  },
  {
    id: 'unanswer',
    action: ContentActions.ENDORSE,
    icon: VerifiedBadge,
    label: messages.unmarkAnsweredAction,
    conditions: {
      endorsed: true,
      postType: ThreadType.QUESTION,
    },
  },
  {
    id: 'close',
    action: ContentActions.CLOSE,
    icon: QuestionAnswer,
    label: messages.closeAction,
    conditions: { closed: false },
  },
  {
    id: 'reopen',
    action: ContentActions.CLOSE,
    icon: QuestionAnswer,
    label: messages.reopenAction,
    conditions: { closed: true },
  },
  {
    id: 'report',
    action: ContentActions.REPORT,
    icon: Flag,
    label: messages.reportAction,
    conditions: { abuseFlagged: false },
  },
  {
    id: 'unreport',
    action: ContentActions.REPORT,
    icon: Flag,
    label: messages.unreportAction,
    conditions: { abuseFlagged: true },
  },
  {
    id: 'delete',
    action: ContentActions.DELETE,
    icon: Delete,
    label: messages.deleteAction,
    conditions: { canDelete: true },
  },
];

export function useActions(content) {
  const checkConditions = (item, conditions) => (
    conditions
      ? Object.keys(conditions)
        .map(key => item[key] === conditions[key])
        .every(condition => condition === true)
      : true
  );
  return ACTIONS_LIST.filter(
    ({
      action,
      conditions = null,
    }) => checkPermissions(content, action) && checkConditions(content, conditions),
  );
}

export const formikCompatibleHandler = (formikHandler, name) => (value) => formikHandler({
  target: {
    name,
    value,
  },
});

/**
 * A wrapper for the generatePath function that generates a new path that keeps the existing
 * query parameters intact
 * @param path
 * @param params
 * @return {function(*): *&{pathname: *}}
 */
export const discussionsPath = (path, params) => {
  const pathname = generatePath(path, params);
  return (location) => ({ ...location, pathname });
};
