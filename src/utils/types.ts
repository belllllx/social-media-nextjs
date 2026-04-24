export interface ICommonResponse {
  status: number;
  success: boolean;
  message: string | string[];
  data?: Record<string, unknown> | string | unknown[];
}

export type ApiBody<T> = T;

export type OtpBody = {
  otp: string;
}

export type IForgotPasswordPayload = {
  email: string;
  sendEmailVerified: boolean;
}

export type IResetPasswordPayload = {
  email: string;
  otpVerified: boolean;
}

export type IErrorTokenPayload = {
  socialAuthVerified: boolean;
}

export type IAtPayload = {
  id: string;
  authVerified: boolean;
}

export enum Role {
  USER,
  ADMIN,
}

export enum ProviderType {
  LOCAL,
  GOOGLE,
  GITHUB,
}

export interface IUser {
  id: string;
  fullname: string;
  username: string | null;
  email: string;
  dateOfBirth: Date | null;
  profileUrl: string | null;
  profileBackgroundUrl: string | null;
  info: string | null;
  role: Role;
  providerType: ProviderType;
  createdAt: Date;
  updatedAt: Date;
  followings: ({ following: IUser } & IFollower)[];
  followers: ({ follower: IUser } & IFollower)[];
}

enum NotificationType {
  LIKE,
  COMMENT,
  FOLLOW,
  SHARE,
  POST,
  REPLY,
}

export interface INotify {
  id: string;
  type: NotificationType;
  senderId: string;
  receiverId: string;
  postId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: IUser;
}

export interface IToken {
  accessToken: string;
  refreshToken: string;
}

export interface IFollower {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  followerId: string;
  followingId: string;
}

export type OnlineUsers = (IUser & {
  active: boolean;
});

export interface ILike {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  postId: string | null;
  commentId: string | null;
  user: IUser;
}

export interface IPost {
  message: string | null;
  userId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  parentId: string | null;
  user: IUser;
  likes: ILike[];
  filesUrl: string[];
  parent?: IPost;
  comments: IComment[];
  commentsCount: number;
}

export interface IComment {
  id: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  userId: string;
  parentId?: string;
  replyId?: string;
  user: IUser;
  fileUrl?: string;
  likes: ILike[];
  parent?: IComment;
  reply?: IComment;
  replysCount: number;
  replies: IComment[];
  replyToUserId: string | null;
  replyToUser: IUser | null;
}

export type CreatePostPayload = {
  message?: string;
  filesUrl: string[];
}

export type DeleteFilePayload = {
  fileUrl: string;
}

export type UpdatePostPayload = {
  message?: string,
  filesUrl: string[];
  shouldDeleteCurrentFiles?: boolean;
  isSharePost: boolean;
}

export type CreateCommentPayload = {
  message?: string;
  fileUrl?: string;
  replyToUserId?: string;
}

export type UpdateCommentPayload = {
  message: string,
  fileUrl?: string;
  shouldDeleteCurrentFile?: boolean;
}

export type EditUserInfoPayload = {
  fullname?: string | undefined;
  dateOfBirth?: Date | null;
  info?: string | null;
}