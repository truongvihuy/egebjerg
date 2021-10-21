import React from 'react';
import {
  StyledSuggestionBox,
  StyledSuggestionItem,
  StyledImageWrapper,
  StyledText
} from './search.style';
import { SearchIcon } from 'assets/icons/SearchIcon';
import parse from 'html-react-parser';
import { getImageSrc } from 'utils/general-helper';

interface Props {
  isOpen: boolean;
  suggestions: any;
  selectedRow: number | null;
  onSelect: (e: any) => void;
}

export const SuggestionBox: React.FC<Props> = ({
  isOpen,
  suggestions = [],
  selectedRow = null,
  onSelect,
}) => {
  return isOpen && (
    <StyledSuggestionBox id='suggestion-list'>
      {suggestions.map((suggestion: any, index) => suggestion._id ? (
        <StyledSuggestionItem key={index} className={`product${index === selectedRow ? ' selected' : ''}`}
          onClick={() => onSelect(suggestion)}>
          <StyledImageWrapper>
            <img src={getImageSrc(suggestion.image)} />
          </StyledImageWrapper>
          <StyledText>{parse(suggestion.highlighted)}</StyledText>
        </StyledSuggestionItem>
      ) : (
        <StyledSuggestionItem key={index} className={`keyword${index === selectedRow ? ' selected' : ''}`}
          onClick={() => onSelect(suggestion)}>
          <SearchIcon color='#77798C'
            style={{ marginLeft: 16, marginRight: 16, color: '#212121', alignSelf: 'center', }}
          />
          <StyledText>{parse(suggestion.highlighted)}</StyledText>
        </StyledSuggestionItem>
      ))}
    </StyledSuggestionBox>
  );
};
