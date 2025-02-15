import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import { convertImageView, addToken } from 'src/util';
import * as postController from 'src/api/post';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Button from 'ming-ui/components/Button';

import { PREVIEW_TYPE, LOADED_STATUS } from './constant/enum';
import * as Actions from './actions/action';
import * as previewUtil from './constant/util';
import VideoPlayer from './VideoPlayer';
import ImageViewer from './imageViewer/imageViewer';
import CodeViewer from './codeViewer/codeViewer';
import ThumbnailGuide from './thumbnailGuide';
import AttachmentInfo from './attachmentInfo';
import PreviewHeader from './previewHeader/previewHeader';
import AttachmentsLoading from './attachmentsLoading';
import { formatFileSize, getClassNameByExt } from 'src/util';
import './attachmentsPreview.less';

class AttachmentsPreview extends React.Component {
  static propTypes = {
    attachments: PropTypes.array,
    actions: PropTypes.object,
    onClose: PropTypes.func,
    options: PropTypes.object,
    extra: PropTypes.object,
    performUpdateItem: PropTypes.func,
    index: PropTypes.number,
    loading: PropTypes.bool,
    error: PropTypes.any,
    showAttInfo: PropTypes.bool,
    fullscreen: PropTypes.bool,
  };

  state = {
    style: { opacity: 0 },
    attInfoFolded: true,
    showThumbnail: false,
  };

  componentDidMount() {
    const options = _.assign({}, this.props.options, {
      onClose: this.props.onClose,
    });
    const extra = this.props.extra || {};
    this.props.actions.init(options, extra);
    if (window.closeFns) {
      window.closeindex = (window.closeindex || 0) + 1;
      this.id = Math.random() && Math.random();
      window.closeFns[this.id] = {
        id: this.id,
        index: window.closeindex,
        fn: this.props.onClose,
      };
    }
    setTimeout(
      () =>
        this.setState({
          style: { opacity: 1 },
        }),
      0,
    );
    $(document).on('keydown', this.handleKeyDown);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.refIconCon) {
      this.handlePreviewLinkThumbnail(
        this.refIconCon,
        this.props.attachments[this.props.index].sourceNode.originLinkUrl,
      );
    }
  }

  componentWillUnmount() {
    this.props.actions.loading();
    $(document).off('keydown', this.handleKeyDown);
    if (window.closeFns) {
      delete window.closeFns[this.id];
    }
  }

  onWheel = evt => {
    evt = _.assign({}, evt);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (evt.deltaY > 0) {
        if (this.btnNext) {
          this.btnNext.click();
        }
      } else if (this.btnPrev) {
        this.btnPrev.click();
      }
    }, 250);
  };

  handleKeyDown = evt => {
    if (evt.key === 'Escape' && _.isEmpty(window.closeFns)) {
      if (typeof this.props.onClose === 'function') {
        this.props.onClose();
        return;
      }
    }
    if (evt.keyCode === 27 && this.props.fullscreen) {
      // TODO 全屏处理
      this.props.actions.toggleFullScreen();
    }
    if (evt.keyCode === 37) {
      if (this.btnPrev) {
        this.btnPrev.click();
      }
    }
    if (evt.keyCode === 39) {
      if (this.btnNext) {
        this.btnNext.click();
      }
    }
    if (evt.keyCode === 38 || evt.keyCode === 40) {
      evt.preventDefault();
    }
  };

  smallit = () => {
    this.refImageViewer.smallit();
  };

  fitit = () => {
    this.refImageViewer.fitit();
  };

  rotate = () => {
    this.refImageViewer.rotate();
  };

  bigit = () => {
    this.refImageViewer.bigit();
  };

  handlePreviewLinkThumbnail = (iconCon, url) => {
    const _this = this;
    $(iconCon).html('<span class="fileIcon-link linkIcon"></span>');
    if (this.previewLinkAjax) {
      this.previewLinkAjax.abort();
    }
    this.previewLinkAjax = postController.getLinkViewInfo({
      url,
      minWidth: 20,
    });
    this.previewLinkAjax.then(data => {
      if (data) {
        let imgArr = [];
        if (data.thumbnails) {
          imgArr = data.thumbnails;
        }
        if (imgArr && imgArr.length) {
          const img = $(
            '<div class="linkThumbnailCon"><div class="linkThumbnail"><img src="' + imgArr[0] + '" /></div></div>',
          );
          img.find('img').on('error', () => {
            $(iconCon).html('<span class="linkIcon"></span>');
          });
          $(iconCon).html(img);
        }
      }
    });
  };

  toggleThumbnail = status => {
    this.setState({
      showThumbnail: status,
    });
  };

  render() {
    if (!this.props.attachments.length) {
      return <LoadDiv />;
    }
    const { attachments, index, showAttInfo, hideFunctions, extra, error } = this.props;
    const currentAttachment = attachments[index];
    const { previewType, ext, name, previewAttachmentType } = currentAttachment;
    let viewUrl = currentAttachment.viewUrl ? addToken(currentAttachment.viewUrl) : null;
    let { canDownload, showDownload } = previewUtil.getPermission(currentAttachment, { hideFunctions });

    if (error && error.status === LOADED_STATUS.DELETED) {
      canDownload = false;
    }

    const isFullScreen = this.props.fullscreen; // ***** TODO 全屏

    return (
      <div
        className={cx('attachmentsPreview flexColumn', { fullscreen: isFullScreen })}
        style={this.state.style}
        onWheel={this.onWheel}
      >
        <PreviewHeader onClose={this.props.onClose} />
        <div className="previewPanel" style={!this.state.attInfoFolded && showAttInfo ? { right: 328 } : {}}>
          <div
            className="previewContainer"
            ref={previewCon => {
              this.refPreviewCon = previewCon;
            }}
            style={{
              bottom: this.state.showThumbnail ? '143px' : '50px',
            }}
          >
            <div className="ctrlCon">
              {this.props.index > 0 && (
                <span
                  className="prev"
                  ref={prev => {
                    this.btnPrev = prev;
                  }}
                  onClick={this.props.actions.prev}
                >
                  <i className="icon-arrow-left-border" />
                </span>
              )}
              {this.props.index < this.props.attachments.length - 1 && (
                <span
                  className="next"
                  ref={next => {
                    this.btnNext = next;
                  }}
                  onClick={this.props.actions.next}
                >
                  <i className="icon-arrow-right-border" />
                </span>
              )}
            </div>
            {this.props.loading ? (
              <AttachmentsLoading />
            ) : (
              (() => {
                if (error) {
                  const errorText = error.text;
                  return (
                    <div className="canNotView">
                      <span className={'canNotViewIcon ' + getClassNameByExt('.' + ext)} />
                      <p className="fileName">
                        <span className="ellipsis">{name}</span>
                        {ext ? '.' + ext : ''}
                      </p>
                      <p className="detail">预览失败{typeof error === 'boolean' ? '' : ', ' + errorText}</p>
                      {canDownload && showDownload && (
                        <Button
                          className="downloadBtn"
                          onClick={() => {
                            window.open(previewUtil.getDownloadUrl(currentAttachment, this.props.extra));
                          }}
                        >
                          下载
                        </Button>
                      )}
                    </div>
                  );
                }
                switch (previewType) {
                  case PREVIEW_TYPE.PICTURE: {
                    return (
                      <ImageViewer
                        className="fileViewer imageViewer"
                        ref={imageViewer => {
                          this.refImageViewer = imageViewer;
                        }}
                        src={convertImageView(viewUrl)}
                        con={this.refPreviewCon}
                        toggleFullscreen={this.props.actions.toggleFullScreen}
                        fullscreen={isFullScreen}
                        onClose={this.props.onClose}
                        onError={() => {
                          this.props.actions.error();
                        }}
                        showThumbnail={this.state.showThumbnail}
                      />
                    );
                  }
                  case PREVIEW_TYPE.IFRAME:
                    if (previewAttachmentType === 'KC' && extra && extra.shareFolderId) {
                      viewUrl = previewUtil.urlAddParams(viewUrl, { shareFolderId: extra.shareFolderId });
                    }
                    return (
                      <iframe
                        className="fileViewer iframeViewer"
                        src={viewUrl}
                        sandbox="allow-forms allow-scripts allow-same-origin"
                      />
                    );
                  case PREVIEW_TYPE.CODE:
                  case PREVIEW_TYPE.MARKDOWN:
                    return (
                      <CodeViewer
                        className="fileViewer"
                        src={viewUrl}
                        type={previewType === PREVIEW_TYPE.CODE ? 'code' : 'markdown'}
                        onError={() => {
                          this.props.actions.error();
                        }}
                      />
                    );
                  case PREVIEW_TYPE.LINK:
                    return (
                      <div className="linkPreview">
                        <a
                          className="linkIconCon"
                          ref={iconCon => {
                            this.refIconCon = iconCon;
                          }}
                          rel="noopener noreferrer"
                          target="_blank"
                          href={currentAttachment.sourceNode.shortLinkUrl}
                        >
                          <span className="fileIcon-link linkIcon" />
                        </a>
                        <p className="fileName">
                          <span className="ellipsis">{currentAttachment.name}</span>
                          <span>.url</span>
                        </p>
                        <a
                          className="detail ellipsis"
                          rel="noopener noreferrer"
                          target="_blank"
                          href={currentAttachment.sourceNode.shortLinkUrl}
                        >
                          {currentAttachment.sourceNode.originLinkUrl}
                        </a>
                        <Button
                          className="downloadBtn boderRadAll_3 ThemeBGColor3"
                          rel="noopener noreferrer"
                          target="_blank"
                          onClick={() => {
                            window.open(currentAttachment.sourceNode.shortLinkUrl);
                          }}
                        >
                          打开链接
                        </Button>
                      </div>
                    );
                  case PREVIEW_TYPE.VIDEO:
                    return <VideoPlayer src={currentAttachment.viewUrl} attachment={currentAttachment} />;
                  case PREVIEW_TYPE.NEW_PAGE:
                  case PREVIEW_TYPE.OTHER:
                  default:
                    return (
                      <div className="canNotView">
                        <span className={'canNotViewIcon ' + getClassNameByExt(ext)} />
                        <p className="fileName">
                          <span className="ellipsis">{name}</span>
                          {ext ? '.' + ext : ''}
                        </p>
                        {currentAttachment.msg && <div className="msg">{currentAttachment.msg}</div>}
                        {(() => {
                          if (previewType === PREVIEW_TYPE.NEW_PAGE && viewUrl) {
                            return (
                              <Button
                                className="downloadBtn"
                                onClick={() => {
                                  window.open(viewUrl);
                                }}
                              >
                                预览
                              </Button>
                            );
                          } else if (canDownload && showDownload) {
                            return (
                              <Button
                                className="downloadBtn"
                                onClick={() => {
                                  window.open(previewUtil.getDownloadUrl(currentAttachment, this.props.extra));
                                }}
                              >
                                下载
                              </Button>
                            );
                          }
                        })()}
                        <p className="detail">
                          大小：{formatFileSize(currentAttachment.size || currentAttachment.filesize)}
                        </p>
                      </div>
                    );
                }
              })()
            )}
          </div>
          {previewType === PREVIEW_TYPE.PICTURE ? (
            <ThumbnailGuide
              bigit={this.bigit}
              smallit={this.smallit}
              rotate={this.rotate}
              fitit={this.fitit}
              toggleThumbnail={this.toggleThumbnail}
            />
          ) : (
            <ThumbnailGuide toggleThumbnail={this.toggleThumbnail} />
          )}
        </div>
        {showAttInfo && (
          <AttachmentInfo
            toggleInfo={flag => {
              this.setState({
                attInfoFolded: !flag,
              });
            }}
            visible={!this.state.attInfoFolded}
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    data: state,
    attachments: state.attachments,
    hideFunctions: state.hideFunctions,
    loading: state.loading,
    index: state.index,
    error: state.error,
    showAttInfo: state.showAttInfo,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch),
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AttachmentsPreview);
