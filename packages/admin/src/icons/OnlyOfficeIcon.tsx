import { SvgIcon, SvgIconProps } from '@mui/material';

const SvgComponent = (props: SvgIconProps) => (
  <SvgIcon viewBox="0 0 72 67" fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M31.503 65.774 1.892 52.181c-2.523-1.187-2.523-3.021 0-4.1L12.2 43.334l19.193 8.846c2.522 1.187 6.58 1.187 8.993 0l19.192-8.846 10.31 4.747c2.522 1.186 2.522 3.02 0 4.1L40.277 65.773c-2.303 1.079-6.36 1.079-8.774 0Z"
      fill="url(#a)"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M31.503 49.052 1.892 35.458c-2.523-1.187-2.523-3.021 0-4.1l10.09-4.639 19.521 8.955c2.523 1.186 6.58 1.186 8.993 0l19.522-8.955 10.09 4.64c2.522 1.186 2.522 3.02 0 4.099L40.496 49.052c-2.522 1.186-6.58 1.186-8.993 0Z"
      fill="url(#b)"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M31.503 32.76 1.892 19.168c-2.523-1.187-2.523-3.021 0-4.1L31.503 1.473c2.523-1.186 6.58-1.186 8.993 0l29.612 13.594c2.522 1.187 2.522 3.021 0 4.1L40.496 32.76c-2.522 1.078-6.58 1.078-8.993 0Z"
      fill="url(#c)"
    />
    <defs>
      <linearGradient
        id="a"
        x1={35.974}
        y1={78.659}
        x2={35.974}
        y2={29.03}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FCC2B1" />
        <stop offset={0.885} stopColor="#D9420B" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={35.974}
        y1={57.171}
        x2={35.974}
        y2={24.532}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#DEEDC9" />
        <stop offset={0.661} stopColor="#8BBA25" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={35.974}
        y1={43.955}
        x2={35.974}
        y2={-0.461}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#C2EBFA" />
        <stop offset={1} stopColor="#26A8DE" />
      </linearGradient>
    </defs>
  </SvgIcon>
);

export default SvgComponent;
