import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IFileWithBase64 } from '../fileUtils';
import { jsStyles } from './ReadFileItem.styles';
import DeleteIcon from '@skbkontur/react-icons/Delete';
import { formatBytes } from '../../../lib/utils';
import { TextWidthHelper } from '../../../internal/TextWidthHelper/TextWidthHelper';
import { truncate } from '../../../lib/stringUtils';

interface ReadFileItemProps {
  file: IFileWithBase64;
}

interface ReadFileItemState {
  fileNameWidth: number;
  fileNameSpanWidth: number;
}

export const ReadFileItem = (props: ReadFileItemProps) => {
  const {file} = props;
  const {name, size} = file;

  const textHelperRef = useRef<TextWidthHelper>(null);
  const fileNameSpanRef = useRef<HTMLSpanElement>(null);

  const [state, setState] = useState<ReadFileItemState>({
    fileNameWidth: 0,
    fileNameSpanWidth: 0
  });

  const {fileNameWidth, fileNameSpanWidth} = state;

  const formattedSize = useMemo(() => formatBytes(size, 1), [size]);

  useEffect(() => {
    if (fileNameSpanRef.current && textHelperRef.current) {
      setState({
        fileNameWidth: textHelperRef.current?.getTextWidth(),
        fileNameSpanWidth: fileNameSpanRef.current?.getBoundingClientRect().width
      });
    }
  }, [fileNameSpanRef.current, textHelperRef.current]);

  const truncatedFileName = useMemo(() => {
    if (fileNameWidth <= fileNameSpanWidth) {
      return name;
    }

    const charWidth = Math.ceil(fileNameWidth / name.length);
    const maxCharsCountInSpan = Math.ceil(fileNameSpanWidth / charWidth);

    return truncate(name, maxCharsCountInSpan);
  }, [name, fileNameSpanWidth, fileNameWidth])

  return (
    <div className={jsStyles.root()}>
      <TextWidthHelper ref={textHelperRef} text={name} />
      <span ref={fileNameSpanRef} className={jsStyles.name()}>{truncatedFileName}</span>
      <span className={jsStyles.size()}>{formattedSize}</span>
      <div className={jsStyles.icon()}>
        <DeleteIcon color="#808080" />
      </div>
    </div>
  );
};

ReadFileItem.displayName = "ReadFileItem";
