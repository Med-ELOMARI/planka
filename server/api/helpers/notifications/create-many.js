/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const fs = require('fs');
const path = require('path');
const escapeMarkdown = require('escape-markdown');
const escapeHtml = require('escape-html');

const { mentionMarkupToText } = require('../../../utils/mentions');

const EMAIL_TEMPLATE = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'email-templates', 'email.html'), 'utf8');

const renderEmail = (vars) =>
  Object.keys(vars).reduce(
    (html, key) => html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), () => vars[key]),
    EMAIL_TEMPLATE,
  );

// Minimal safe markdown-to-HTML for email (no new libs — pure regex on pre-escaped content)
const markdownToHtml = (text) =>
  text
    .split(/\n\n+/)
    .map((para) => {
      let line = para
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

      line = line.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
      line = line.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
      line = line.replace(/_([^_\n]+)_/g, '<em>$1</em>');
      line = line.replace(/`([^`\n]+)`/g, '<code style="background:#f0eef8;padding:2px 5px;border-radius:3px;font-family:monospace;font-size:13px;">$1</code>');
      line = line.replace(/\[([^\]\n]+)\]\((https?:\/\/[^)\n]+)\)/g, '<a href="$2" style="color:#3a2c69;text-decoration:underline;">$1</a>');
      line = line.replace(/\n/g, '<br>');

      return `<p style="margin:0 0 8px;color:#172b4d;line-height:1.6;">${line}</p>`;
    })
    .join('');

const toTitleCase = (str) => String(str).replace(/\b\w/g, (c) => c.toUpperCase());

const buildTitle = (notification, t) => {
  switch (notification.type) {
    case Notification.Types.MOVE_CARD:
      return t('Card Moved');
    case Notification.Types.COMMENT_CARD:
      return t('New Comment');
    case Notification.Types.ADD_MEMBER_TO_CARD:
      return t('You Were Added to Card');
    case Notification.Types.MENTION_IN_COMMENT:
      return t('You Were Mentioned in Comment');
    default:
      return null;
  }
};

const buildSubject = (project, board, card, notification, t) => {
  const title = buildTitle(notification, t);
  if (!title) return null;
  return `[${toTitleCase(project.name)} > ${toTitleCase(board.name)}] ${title}: ${toTitleCase(card.name)}`;
};

const buildBodyByFormat = (board, card, notification, actorUser, t) => {
  const markdownCardLink = `[${escapeMarkdown(card.name)}](${sails.config.custom.baseUrl}/cards/${card.id})`;
  const htmlCardLink = `<a href="${sails.config.custom.baseUrl}/cards/${card.id}">${escapeHtml(card.name)}</a>`;

  switch (notification.type) {
    case Notification.Types.MOVE_CARD: {
      const fromListName = sails.helpers.lists.resolveName(notification.data.fromList, t);
      const toListName = sails.helpers.lists.resolveName(notification.data.toList, t);

      return {
        text: t(
          '%s moved %s from %s to %s on %s',
          actorUser.name,
          card.name,
          fromListName,
          toListName,
          board.name,
        ),
        markdown: t(
          '%s moved %s from %s to %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          `**${escapeMarkdown(fromListName)}**`,
          `**${escapeMarkdown(toListName)}**`,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s moved %s from %s to %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          `<b>${escapeHtml(fromListName)}</b>`,
          `<b>${escapeHtml(toListName)}</b>`,
          escapeHtml(board.name),
        ),
      };
    }
    case Notification.Types.COMMENT_CARD: {
      const commentText = _.truncate(mentionMarkupToText(notification.data.text));

      return {
        text: `${t(
          '%s left a new comment to %s on %s',
          actorUser.name,
          card.name,
          board.name,
        )}:\n${commentText}`,
        markdown: `${t(
          '%s left a new comment to %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          escapeMarkdown(board.name),
        )}:\n\n*${escapeMarkdown(commentText)}*`,
        html: `${t(
          '%s left a new comment to %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          escapeHtml(board.name),
        )}:\n\n<i>${escapeHtml(commentText)}</i>`,
      };
    }
    case Notification.Types.ADD_MEMBER_TO_CARD:
      return {
        text: t('%s added you to %s on %s', actorUser.name, card.name, board.name),
        markdown: t(
          '%s added you to %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          escapeMarkdown(board.name),
        ),
        html: t(
          '%s added you to %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          escapeHtml(board.name),
        ),
      };
    case Notification.Types.MENTION_IN_COMMENT: {
      const commentText = _.truncate(mentionMarkupToText(notification.data.text));

      return {
        text: `${t(
          '%s mentioned you in %s on %s',
          actorUser.name,
          card.name,
          board.name,
        )}:\n${commentText}`,
        markdown: `${t(
          '%s mentioned you in %s on %s',
          escapeMarkdown(actorUser.name),
          markdownCardLink,
          escapeMarkdown(board.name),
        )}:\n\n*${escapeMarkdown(commentText)}*`,
        html: `${t(
          '%s mentioned you in %s on %s',
          escapeHtml(actorUser.name),
          htmlCardLink,
          escapeHtml(board.name),
        )}:\n\n<i>${escapeHtml(commentText)}</i>`,
      };
    }
    default:
      return null;
  }
};

const buildAndSendNotifications = async (services, board, card, notification, actorUser, t) => {
  await sails.helpers.utils.sendNotifications(
    services,
    buildTitle(notification, t),
    buildBodyByFormat(board, card, notification, actorUser, t),
  );
};

// TODO: use templates (views) to build html
const buildEmail = (project, board, card, notification, actorUser, notifiableUser, t) => {
  const subject = buildSubject(project, board, card, notification, t);
  if (!subject) return null;

  const cardUrl = `${sails.config.custom.baseUrl}/cards/${card.id}`;
  const cardLink = `<a href="${cardUrl}" style="color:#3a2c69;font-weight:600;text-decoration:none;">${escapeHtml(toTitleCase(card.name))}</a>`;
  const boardLink = `<a href="${sails.config.custom.baseUrl}/boards/${board.id}" style="color:#3a2c69;font-weight:600;text-decoration:none;">${escapeHtml(toTitleCase(board.name))}</a>`;
  const actorName = `<strong>${escapeHtml(toTitleCase(actorUser.name))}</strong>`;
  const projectName = `<strong>${escapeHtml(toTitleCase(project.name))}</strong>`;

  const p = (content) =>
    `<p style="margin:0 0 12px;font-size:15px;color:#172b4d;line-height:1.6;">${content}</p>`;

  const blockquote = (content) =>
    `<blockquote style="margin:0 0 4px;padding:12px 16px;background:#f4f5f7;border-left:4px solid #3a2c69;border-radius:0 4px 4px 0;font-size:14px;color:#505f79;line-height:1.6;">${content}</blockquote>`;

  let bodyHtml;
  switch (notification.type) {
    case Notification.Types.MOVE_CARD: {
      const fromListName = sails.helpers.lists.resolveName(notification.data.fromList, t);
      const toListName = sails.helpers.lists.resolveName(notification.data.toList, t);

      bodyHtml = p(
        `User ${actorName} moved Card ${cardLink} from List <strong>${escapeHtml(toTitleCase(fromListName))}</strong> to List <strong>${escapeHtml(toTitleCase(toListName))}</strong> on Board ${boardLink} in Project ${projectName}`,
      );
      break;
    }
    case Notification.Types.COMMENT_CARD: {
      const commentText = mentionMarkupToText(notification.data.text);
      bodyHtml =
        p(`User ${actorName} left a new comment on Card ${cardLink} on Board ${boardLink} in Project ${projectName}:`) +
        blockquote(markdownToHtml(commentText));
      break;
    }
    case Notification.Types.ADD_MEMBER_TO_CARD:
      bodyHtml = p(
        `User ${actorName} added you to Card ${cardLink} on Board ${boardLink} in Project ${projectName}`,
      );
      break;
    case Notification.Types.MENTION_IN_COMMENT: {
      const commentText = mentionMarkupToText(notification.data.text);
      bodyHtml =
        p(`User ${actorName} mentioned you in a comment on Card ${cardLink} on Board ${boardLink} in Project ${projectName}:`) +
        blockquote(markdownToHtml(commentText));
      break;
    }
    default:
      return null;
  }

  const breadcrumb = `<strong style="color:#172b4d;">${escapeHtml(toTitleCase(project.name))}</strong> &rsaquo; ${boardLink}`;

  const html = renderEmail({
    subject,
    recipientName: escapeHtml(toTitleCase(notifiableUser.name)),
    body: bodyHtml,
    breadcrumb,
    cardUrl,
    projectName: escapeHtml(project.name),
    baseUrl: sails.config.custom.baseUrl,
  });

  return {
    html,
    to: notifiableUser.email,
    subject,
  };
};

const sendEmails = async (transporter, emails) => {
  await Promise.all(
    emails.map((email) =>
      sails.helpers.utils.sendEmail.with({
        ...email,
        transporter,
      }),
    ),
  );

  transporter.close();
};

module.exports = {
  inputs: {
    arrayOfValues: {
      type: 'ref',
      required: true,
    },
    project: {
      type: 'ref',
      required: true,
    },
    board: {
      type: 'ref',
      required: true,
    },
    list: {
      type: 'ref',
      required: true,
    },
    webhooks: {
      type: 'ref',
      required: true,
    },
  },

  async fn(inputs) {
    const { arrayOfValues } = inputs;

    const ids = await sails.helpers.utils.generateIds(arrayOfValues.length);
    const valuesById = {};

    const notifications = await Notification.qm.create(
      arrayOfValues.map((values) => {
        const id = ids.shift();

        const nextValues = {
          ...values,
          id,
          creatorUserId: values.creatorUser.id,
          boardId: values.card.boardId,
          cardId: values.card.id,
        };
        if (values.comment) {
          nextValues.commentId = values.comment.id;
        }
        if (values.action) {
          nextValues.actionId = values.action.id;
        }

        valuesById[id] = { ...nextValues }; // FIXME: hack
        return nextValues;
      }),
    );

    notifications.forEach((notification) => {
      const values = valuesById[notification.id];

      sails.sockets.broadcast(`user:${notification.userId}`, 'notificationCreate', {
        item: notification,
        included: {
          users: [sails.helpers.users.presentOne(values.creatorUser, {})], // FIXME: hack
        },
      });

      sails.helpers.utils.sendWebhooks.with({
        webhooks: inputs.webhooks,
        event: Webhook.Events.NOTIFICATION_CREATE,
        buildData: () => ({
          item: notification,
          included: {
            projects: [inputs.project],
            boards: [inputs.board],
            lists: [inputs.list],
            cards: [values.card],
            ...(notification.commentId
              ? {
                  comments: [values.comment],
                }
              : {
                  actions: [values.action],
                }),
          },
        }),
        user: values.creatorUser,
      });
    });

    const notificationsByUserId = _.groupBy(notifications, 'userId');

    const notifiableUsers = await User.qm.getByIds(Object.keys(notificationsByUserId), {
      withDeactivated: false,
    });

    if (notifiableUsers.length > 0) {
      const notifiableUserIds = sails.helpers.utils.mapRecords(notifiableUsers);

      const notificationServices = await NotificationService.qm.getByUserIds(notifiableUserIds);
      const { transporter } = await sails.helpers.utils.makeSmtpTransporter();

      if (notificationServices.length > 0 || transporter) {
        const notificationServicesByUserId = _.groupBy(notificationServices, 'userId');

        notifiableUsers.forEach(async (notifiableUser) => {
          const t = sails.helpers.utils.makeTranslator(notifiableUser.language);

          const emails = notificationsByUserId[notifiableUser.id].flatMap((notification) => {
            const values = valuesById[notification.id];

            if (notificationServicesByUserId[notifiableUser.id]) {
              const services = notificationServicesByUserId[notifiableUser.id].map(
                (notificationService) => _.pick(notificationService, ['url', 'format']),
              );

              buildAndSendNotifications(
                services,
                inputs.board,
                values.card,
                notification,
                values.creatorUser,
                t,
              );
            }

            if (transporter) {
              return buildEmail(
                inputs.project,
                inputs.board,
                values.card,
                notification,
                values.creatorUser,
                notifiableUser,
                t,
              );
            }

            return [];
          });

          if (emails.length > 0) {
            sendEmails(transporter, emails);
          }
        });
      }
    }

    return notifications;
  },
};
