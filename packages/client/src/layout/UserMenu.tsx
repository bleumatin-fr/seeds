import {
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { MouseEvent, useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';
import { useAuthentication } from '../authentication/context/useAuthentication';
import useUser from '../authentication/context/useUser';
import PasswordChangeModal from '../authentication/PasswordChangeModal';
import ProfileChangeModal from '../authentication/ProfileChangeModal';
import useOnboarding, { OnboardingStep } from '../onboarding/useOnboarding';
import AccountIcon from '../ui/icons/account.svg?react';
import PasswordIcon from '../ui/icons/change-password.svg?react';
import CompassIcon from '../ui/icons/compass.svg?react';
import ExitIcon from '../ui/icons/exit.svg?react';

// https://stackoverflow.com/a/72595895/1665540
const contrastColor = (backgroundColor: string) => {
  try {
    return ['#060606', 'white'][
      ~~(
        [1, 3, 5]
          .map((p) => parseInt(backgroundColor.substr(p, 2), 16))
          .reduce((r, v, i) => [0.299, 0.587, 0.114][i] * v + r, 0) < 128
      )
    ];
  } catch (e) {
    return '#060606';
  }
};

const stringToColor = (name: string, saturation = 100, lightness = 75) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return {
    bgcolor: `hsl(${hash % 360}, ${saturation}%, ${lightness}%)`,
    color: contrastColor(`${hash % 360}`),
  };
};

const stringAvatar = (name: string) => {
  return {
    sx: {
      cursor: 'pointer',
      border: '2px solid #060606',
      ...stringToColor(name),
    },
    children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
  };
};

const Title = styled.p`
  font-size: 1rem;
  font-weight: 500;
  padding: 16px;
  max-width: 250px;
  text-align: center;

  span {
    font-weight: bold;
  }
`;

const UserMenu = () => {
  const { logout } = useAuthentication();
  const { user } = useUser();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [tourTooltipOpen, setTourTooltipOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const {
    step: onboardingStep,
    setStep: setOnboardingStep,
    collapsed: onboardingCollapsed,
    setCollapsed: setOnboardingCollapsed,
    tooltipShown: tourTooltipShown,
    setTooltipShown: setTourTooltipShown,
  } = useOnboarding();

  const formerOnboardingCollapsed = useRef(onboardingCollapsed);

  useEffect(() => {
    if (
      !tourTooltipShown &&
      !formerOnboardingCollapsed.current &&
      onboardingCollapsed
    ) {
      setOpen(true);
      setTimeout(() => {
        setTourTooltipOpen(true);
        setTourTooltipShown(true);
        setTimeout(() => {
          setTourTooltipOpen(false);
        }, 10000);
      }, 500);
    }
    formerOnboardingCollapsed.current = onboardingCollapsed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingCollapsed]);

  if (!user) return null;

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    setOpen(true);
  };

  const handleClose = () => {
    setTourTooltipOpen(false);
    setOpen(false);
  };

  const handlePasswordChangeClick = () => {
    handleClose();
    setPasswordModalOpen(true);
  };

  const handleProfileChangeClick = () => {
    handleClose();
    setProfileModalOpen(true);
  };

  const handleTourStartClick = () => {
    handleClose();
    if (onboardingStep === OnboardingStep.DONE) {
      setOnboardingCollapsed(false);
      setOnboardingStep(OnboardingStep.WELCOME, true);
      return;
    }
    setOnboardingCollapsed(false);
  };

  return (
    <>
      <PasswordChangeModal
        open={passwordModalOpen}
        handleClose={() => setPasswordModalOpen(false)}
      ></PasswordChangeModal>
      <ProfileChangeModal
        open={profileModalOpen}
        handleClose={() => setProfileModalOpen(false)}
      ></ProfileChangeModal>
      <Avatar
        {...stringAvatar(`${user?.firstName[0]} ${user?.lastName[0]}`)}
        onClick={handleClick}
        ref={avatarRef}
      />

      <Menu
        id="user-menu"
        open={open}
        anchorEl={avatarRef.current}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Title>
          Connecté en tant que{' '}
          <span>
            {user?.firstName} {user?.lastName}
          </span>
        </Title>
        <Divider sx={{ margin: '8px 0' }} />
        <MenuItem onClick={handleProfileChangeClick}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifier profil</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePasswordChangeClick}>
          <ListItemIcon>
            <PasswordIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Changer mot de passe</ListItemText>
        </MenuItem>
        <Divider />
        <Tooltip
          title="Revenez à tout moment à ce tutoriel en cliquant ici"
          open={tourTooltipOpen}
        >
          <MenuItem onClick={handleTourStartClick} selected={tourTooltipOpen}>
            <ListItemIcon>
              <CompassIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tutoriel SEEDS</ListItemText>
          </MenuItem>
        </Tooltip>
        <Divider />
        <MenuItem onClick={logout}>
          <ListItemIcon>
            <ExitIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Se déconnecter</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
