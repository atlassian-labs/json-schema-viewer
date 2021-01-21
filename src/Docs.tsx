import EmptyState from '@atlaskit/empty-state';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import introduction from './docs/introduction.md';
import usage from './docs/usage.md';
import { Markdown } from './markdown';
import Spinner from '@atlaskit/spinner';

type RouteParams = {
   id: string;
}

const docsMap: { [key: string]: string } = {
   introduction,
   usage
};

type LoadResult = FileLoaded | FileLoadedFailed | undefined;

type FileLoaded = {
   loadId: string;
   fileContents: string;
};

type FileLoadedFailed = {
   loadId: string;
   message: string;
};

function isLoadError(r: FileLoaded | FileLoadedFailed): r is FileLoadedFailed {
   return 'message' in r;
}

const Container = styled.div`
   margin: 24px 24px;
   padding: 0;
`;

export const Docs: React.FC = () => {
   let { id } = useParams<RouteParams>();

   const [loadResult, setLoadResult] = useState<LoadResult>(undefined);

   const loadFileContents = async () => {
      const docsUrl = docsMap[id];

      if (docsUrl === undefined) {
         setLoadResult({ message: 'There are no docs at this URL.', loadId: id });
      } else {
         try {
            const fileContents = await fetch(docsUrl).then(r => r.text());
            setLoadResult({ fileContents, loadId: id });
         } catch (e) {
            setLoadResult({ message: e.message, loadId: id });
         }
      }
   };

   useEffect(() => {
      if (loadResult === undefined || loadResult.loadId !== id) {
         loadFileContents();
      }
   });

   if (loadResult === undefined) {
      return (
         <EmptyState
            header="Loading docs..."
            description="Attempting to load the docs."
            primaryAction={(
               <Spinner size="xlarge" />
            )}
         />
      );
   }

   if (isLoadError(loadResult)) {
      return (
         <EmptyState
            header="No documentation found."
            description="There is no documentation here. Please use the top navigation to find what you are looking for."
         />
      )
   }

   const { fileContents } = loadResult;
   return (
      <Container><Markdown source={fileContents}></Markdown></Container>
   );
};