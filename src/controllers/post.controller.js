import CommentModel from '../models/comment.model.js';
import ConversationModel from '../models/conversation.model.js';
import PostModel from '../models/post.model.js';
import NotificationModel from '../models/notification.model.js';
import { emitNotificationToUser } from '../socket/socketHandler.js';
import { broadcastNotificationToAllUsers } from '../utils/notificationBroadcaster.js';

const emitPostEvent = (req, eventName, payload) => {
  const io = req.app.get('io');

  if (io) {
    io.emit(eventName, payload);
  }
};

export const createPost = async (req, res, next) => {
  try {
    const post = await PostModel.create({
      user_id: req.user.user_id,
      content: req.body.content,
      type: req.body.type,
    });

    await ConversationModel.create({
      type: 'group',
      name: `post-thread:${post.id}`,
      created_by: req.user.user_id,
      member_ids: [req.user.user_id],
    });

    const postWithThread = await PostModel.findById(post.id);
    emitPostEvent(req, 'newPost', postWithThread);

    const io = req.app.get('io');
    if (io) {
      await broadcastNotificationToAllUsers(io, {
        type: 'post',
        content: `A new community post was shared by ${post.user?.name || 'a StayNest member'}.`,
        excludeUserId: req.user.user_id,
      });
    }

    res.status(201).json({
      success: true,
      data: postWithThread,
    });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await PostModel.findAll();

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const existingPost = await PostModel.findById(req.params.id);

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const updatedPost = await PostModel.update(req.params.id, req.body);
    emitPostEvent(req, 'newPost', updatedPost);

    res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const deletedPost = await PostModel.delete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    emitPostEvent(req, 'postDeleted', {
      id: Number(req.params.id),
      post: deletedPost,
    });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
      data: deletedPost,
    });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    try {
      await PostModel.addLike(req.params.id, req.user.user_id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'You have already liked this post.',
        });
      }

      throw error;
    }

    const updatedPost = await PostModel.findById(req.params.id);

    if (post.user_id !== req.user.user_id) {
      const notification = await NotificationModel.create({
        user_id: post.user_id,
        type: 'post_interaction',
        content: `${req.user.role} liked your post.`,
      });

      const io = req.app.get('io');

      if (io) {
        emitNotificationToUser(io, post.user_id, notification);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await CommentModel.findByPostId(req.params.id);

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const comment = await CommentModel.create({
      post_id: req.params.id,
      user_id: req.user.user_id,
      content: req.body.content,
    });

    if (post.user_id !== req.user.user_id) {
      const notification = await NotificationModel.create({
        user_id: post.user_id,
        type: 'post_interaction',
        content: 'Someone commented on your post.',
      });

      const io = req.app.get('io');

      if (io) {
        emitNotificationToUser(io, post.user_id, notification);
      }
    }

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};
