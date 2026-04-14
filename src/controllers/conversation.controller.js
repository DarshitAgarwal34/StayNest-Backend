import ConversationModel from '../models/conversation.model.js';
import ConversationMemberModel from '../models/conversationMember.model.js';

export const createConversation = async (req, res, next) => {
  try {
    const { type = 'private', name = null, member_ids = [] } = req.body;

    const conversation = await ConversationModel.create({
      type,
      name,
      created_by: req.user.user_id,
      member_ids,
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await ConversationModel.findAllForUser(req.user.user_id);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (req, res, next) => {
  try {
    const conversation = await ConversationModel.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    const members = await ConversationModel.getMembers(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        ...conversation,
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const joinConversation = async (req, res, next) => {
  try {
    const conversation = await ConversationModel.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    await ConversationMemberModel.addMember(req.params.id, req.user.user_id);

    const members = await ConversationModel.getMembers(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        ...conversation,
        members,
      },
    });
  } catch (error) {
    next(error);
  }
};
