import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    }
    if (!text && !img) {
      return res
        .status(400)
        .json({ error: "Post musi zawierać tekst lub obraz" });
    }
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post nie istnieje" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "Nie masz uprawnien do usuniecia tego posta" });
    }
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post został usuniety" });
  } catch (error) {
    console.log("Error in deletePost:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const commentOnPosts = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id.toString();

    if (!text) {
      return res.status(400).json({ error: "Komentarz musi zawierać tekst" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post nie istnieje" });
    }

    const comment = { user: userId, text };

    post.comments.push(comment);

    await post.save();

    const updatedPost = await post.populate("comments.user");

    const newComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(200).json(newComment);
  } catch (error) {
    console.log("Error in commentOnPosts:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params; // można zapisać tak : const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post nie istnieje" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      //unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      res.status(200).json(updatedLikes);
    } else {
      // like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });

      await notification.save();
      const updatedLikes = post.likes;
      res.status(200).json(post.likes);
    }
  } catch (error) {
    console.log("Error in likeUnlikePost:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "Użytkownik nie istnieje" });

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ error: "Użytkownik nie istnieje" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts:", error.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
};
