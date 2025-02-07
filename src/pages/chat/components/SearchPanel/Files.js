import React, { Component } from 'react';
import cx from 'classnames';
import * as ajax from '../../utils/ajax';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import Constant from '../../utils/constant';
import * as utils from '../../utils/';
import { convertImageView, getClassNameByExt } from 'src/util';
import { FileItem } from '../Files';

const format = (res) => {
  return res.map((file) => {
    file.$date = createTimeSpan(file.time);
    file.$size = utils.formatFileSize(file.size);
    file.iconClass = getClassNameByExt(`.${File.GetExt(file.name)}`);
    if (file.type === 2) {
      file.previewUrl = convertImageView(file.url, 0, 100, 100);
    }
    return file;
  });
};

export default class Files extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      pageIndex: 1,
      files: [],
    };
  }
  componentDidMount() {
    const { searchText } = this.props;
    this.updateFiles(searchText);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.searchText !== this.props.searchText) {
      this.setState(
        {
          loading: false,
          pageIndex: 1,
          files: [],
        },
        () => {
          this.updateFiles(nextProps.searchText);
        }
      );
    }
  }
  updateFiles(searchText) {
    const { session } = this.props;
    const type = session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
    const { loading, pageIndex, files } = this.state;
    if (loading || !pageIndex) {
      return;
    }
    this.setState({
      loading: true,
    });
    const param = {
      keywords: searchText,
      pageIndex,
      pageSize: 16,
      [session.isGroup ? 'groupId' : 'withUser']: session.id,
    };
    ajax.getFileList(param).then((result) => {
      const { list } = result;
      this.setState({
        pageIndex: list && list.length >= 16 ? pageIndex + 1 : 0,
        loading: false,
        files: files.concat(format(list || [])),
      });
    });
  }
  handleScrollEnd() {
    const { searchText } = this.props;
    this.updateFiles(searchText);
  }
  render() {
    const { files, loading } = this.state;
    return (
      <ScrollView className="ChatPanel-SearchPanelContent ChatPanel-SearchPanel-Files" onScrollEnd={this.handleScrollEnd.bind(this)}>
        {files.map((item, index) => <FileItem item={item} key={item.fileId || index} />)}
        <LoadDiv className={cx('loading', { Hidden: !loading })} size="small" />
        {!loading && !files.length ? (
          <div className="nodata-wrapper">
            <div className="nodata-img" />
            <p>{_l('无匹配结果')}</p>
          </div>
        ) : (
          undefined
        )}
      </ScrollView>
    );
  }
}
