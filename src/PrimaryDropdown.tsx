import React, { useState } from 'react';
import { useOverflowStatus, PrimaryDropdownButton } from '@atlaskit/atlassian-navigation';
import Popup, { PopupProps, ContentProps } from '@atlaskit/popup';
import { ButtonItem } from '@atlaskit/menu';


export type PrimaryDropdownProps = {
   content: (props: ContentPropsWithClose) => JSX.Element;
   text: string;
   isHighlighted?: boolean;
 };

export type ContentPropsWithClose = ContentProps & {
   closePopup: () => void;
}

export const PrimaryDropdown: React.FC<PrimaryDropdownProps> = (props) => {
   const { content, text, isHighlighted } = props;
   const { isVisible, closeOverflowMenu } = useOverflowStatus();
   const [isOpen, setIsOpen] = useState(false);
   const Content = content;
   const onDropdownItemClick = () => {
     console.log(
       'Programmatically closing the menu, even though the click happens inside the popup menu.',
     );
     closeOverflowMenu();
   };

   if (!isVisible) {
     return (
       <ButtonItem testId={text} onClick={onDropdownItemClick}>
         {text}
       </ButtonItem>
     );
   }

   const onClick = () => {
     setIsOpen(!isOpen);
   };

   const onClose = () => {
     setIsOpen(false);
   };

   const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
     if (event.key === 'ArrowDown') {
       setIsOpen(true);
     }
   };

   return (
     <Popup
       content={props => <Content closePopup={() => setIsOpen(false)} {...props} />}
       isOpen={isOpen}
       onClose={onClose}
       placement="bottom-start"
       testId={`${text}-popup`}
       trigger={triggerProps => (
         <PrimaryDropdownButton
           onClick={onClick}
           onKeyDown={onKeyDown}
           isHighlighted={isHighlighted}
           isSelected={isOpen}
           testId={`${text}-popup-trigger`}
           {...triggerProps}
         >
           {text}
         </PrimaryDropdownButton>
       )}
     />
   );
 };