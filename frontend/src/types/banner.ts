export interface Banner {
  id: number;
  title: string;
  headline: string;
  subHeadline: string;
  imageUrl?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  bgColor?: string;
  textColor?: string;
  displayOrder?: number;
  isActive?: boolean;
}
