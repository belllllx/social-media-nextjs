export interface ICommonResponse {
  status: number;
  success: boolean;
  message: string | string[];
  data?: Object | string | any[];
}

export type ApiBody<T> = T;

export interface IOtpBody {
  otp: string;
}

export interface IForgotPasswordPayload {
  email: string;
  sendEmailVerified: boolean;
}

export interface IResetPasswordPayload {
  email: string;
  otpVerified: boolean;
}

export interface IErrorTokenPayload {
  socialAuthVerified: boolean;
}

export interface IAtPayload {
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
  username: string;
  email: string;
  dateOfBirth: Date;
  profileUrl: string;
  profileBackgroundUrl: string;
  info: string;
  role: Role;
  providerType: ProviderType;
  createdAt: Date;
  updatedAt: Date;
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

export type UsersTemp = (IUser & {
  active: boolean;
})[];

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
  filesUrl?: string[];
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
  user: IUser;
  fileUrl?: string;
  likes: ILike[];
  parent?: IComment;
  replysCount: number;
  replies: IComment[];
  replyToUserId: string | null;
  replyToUser: IUser | null;
}

export interface ICreatePostPayload {
  message?: string;
  filesUrl: string[];
}

export interface IDeleteFilePayload {
  fileUrl: string;
}

export interface IUpdatePostPayload {
  message?: string,
  filesUrl: string[];
  shouldDeleteCurrentFiles?: boolean;
}

export interface ICreateCommentPayload {
  message?: string;
  fileUrl?: string;
  replyToUserId?: string;
}

export interface IUpdateCommentPayload {
  message?: string,
  fileUrl?: string;
  shouldDeleteCurrentFile?: boolean;
}