import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IUploadFile, UploadFileStatus } from '../../../lib/fileUtils';
import { jsStyles } from './UploadFile.styles';
import DeleteIcon from '@skbkontur/react-icons/Delete';
import ErrorIcon from '@skbkontur/react-icons/Error';
import OkIcon from '@skbkontur/react-icons/Ok';
import { formatBytes } from '../../../lib/utils';
import { TextWidthHelper } from '../../../internal/TextWidthHelper/TextWidthHelper';
import { truncate } from '../../../lib/stringUtils';
import { Spinner } from '../../../components/Spinner';
import { UploadFilesContext } from '../UploadFilesContext';
import { Tooltip } from '../../../components/Tooltip';
import cn from 'classnames';

interface ReadFileProps {
  file: IUploadFile;
  showSize?: boolean;
}

interface ReadFileState {
  fileNameWidth: number;
  fileNameSpanWidth: number;
}

export const UploadFile = (props: ReadFileProps) => {
  const {file, showSize} = props;
  const {id, originalFile, status, validationResult} = file;
  const {name, size} = originalFile;

  const [hovered, setHovered] = useState<boolean>(false);
  const textHelperRef = useRef<TextWidthHelper>(null);
  const fileNameSpanRef = useRef<HTMLSpanElement>(null);
  const {removeFile} = useContext(UploadFilesContext);

  const [state, setState] = useState<ReadFileState>({
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

  // FIXME @mozalov: почитать про XSS
  const truncatedFileName = useMemo(() => {
    if (!fileNameWidth && !fileNameSpanWidth) {
      return null;
    }

    if (fileNameWidth <= fileNameSpanWidth) {
      return name;
    }

    const charWidth = Math.ceil(fileNameWidth / name.length);
    const maxCharsCountInSpan = Math.ceil(fileNameSpanWidth / charWidth);

    return truncate(name, maxCharsCountInSpan);
  }, [name, fileNameSpanWidth, fileNameWidth]);

  const handleRemove = useCallback((event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    removeFile(id);
  }, [removeFile, id]);

  const { isValid, message } = validationResult;

  const icon: ReactNode = useMemo(() => {
    const deleteIcon = <DeleteIcon color="#808080" onClick={handleRemove} />;

    if (hovered) {
      return deleteIcon;
    }

    switch (status) {
      case UploadFileStatus.Loading:
        return <Spinner type="mini" dimmed caption="" />;
      case UploadFileStatus.Uploaded:
        return <OkIcon />;
      default:
        if (!isValid) {
          return <ErrorIcon />;
        }
        return deleteIcon;
    }
  }, [hovered, status, isValid, handleRemove]);


  const renderTooltipContent = useCallback((): ReactNode => {
    return isValid ? null : message;
  }, [isValid, message]);

  const contentClassNames = useMemo(() => cn(jsStyles.content(), {
    [jsStyles.error()]: !isValid
  }), [isValid]);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <div className={jsStyles.root()} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Tooltip pos="right middle" render={renderTooltipContent}>
        <div className={contentClassNames}>
            <TextWidthHelper ref={textHelperRef} text={name} />
            <span ref={fileNameSpanRef} className={jsStyles.name()}>
              {truncatedFileName}
            </span>
            {!!showSize && formattedSize && (
              <span className={jsStyles.size()}>
                {formattedSize}
              </span>
            )}
            <div className={jsStyles.icon()}>
              {icon}
            </div>
          </div>
      </Tooltip>
    </div>
  );
};

UploadFile.displayName = "UploadFile";
