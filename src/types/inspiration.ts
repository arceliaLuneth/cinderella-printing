export type InspirationInput = {
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
};

export type InspirationPhoto = InspirationInput & { id: string };
