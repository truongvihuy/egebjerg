import React from 'react';
import { Box, SelectedItem, Flag, MenuItem } from './language-switcher.style';
import Popover from 'components/popover/popover';
import { FormattedMessage } from 'react-intl';
import { useLocale } from 'contexts/language/language.provider';
import { LANGUAGE_MENU } from 'config/site-navigation';

const FlagIcon = ({ src }) => {
  return !!src ? <img src={src} /> : <p>Invalid icon</p>;
};

const LanguageMenu = ({ onClick }) => {
  return (
    <>
      {LANGUAGE_MENU.map((item) => (
        <MenuItem onClick={onClick} key={item.id} value={item.id}>
          <span>
            <FlagIcon src={item.icon} />
          </span>
          <FormattedMessage id={item.id} defaultMessage={item.defaultMessage} />
        </MenuItem>
      ))}
    </>
  );
};

const LanguageSwitcher: React.FC<{}> = () => {
  const { locale, changeLanguage } = useLocale();
  const selectedLanguage = LANGUAGE_MENU.find((x) => x.id === locale);
  const languageChangeHandler = (e) => {
    changeLanguage(e.target.value);
  };
  return (
    <Box>
      <Popover
        className="right"
        handler={
          <SelectedItem>
            <Flag>
              <FlagIcon src={selectedLanguage?.icon} />
            </Flag>
            <span>
              <FormattedMessage
                id={selectedLanguage?.id}
                defaultMessage={selectedLanguage?.defaultMessage}
              />
            </span>
          </SelectedItem>
        }
        content={<LanguageMenu onClick={languageChangeHandler} />}
      />
    </Box>
  );
};

export default LanguageSwitcher;
