import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget';
import { enumWidgetType } from 'src/pages/widgetConfig/util';

export function getNewControlColRow(controls, halfOfNewControl = true) {
  if (!controls.length) {
    return { col: 0, row: 0 };
  }
  const maxRow = Math.max(...controls.map(c => c.row));
  const lastRowWidgets = controls.filter(c => c.row === maxRow);
  const lastRowFirstWidget = _.find(controls, c => c.row === maxRow && c.col === 0) || { half: true };
  const maxCol = Math.max(...lastRowWidgets.map(c => c.col));
  return {
    col: halfOfNewControl && lastRowFirstWidget.half ? (maxCol > 0 ? 0 : 1) : 0,
    row: halfOfNewControl && lastRowFirstWidget.half ? (maxCol > 0 ? maxRow + 1 : maxRow) : maxRow + 1,
  };
}

const defaultHidedControlTypes = [26, 27, 21];

export function getDisabledControls(controls, systemRelatedIds = {}) {
  const defaultHided = controls
    .filter(control => defaultHidedControlTypes.includes(control.type))
    .map(control => control.controlId);
  const hidedWhenNew = controls
    .filter(control => (control.controlPermissions || '000')[2] === '0')
    .map(control => control.controlId);
  const systemRelated = controls
    .filter(control =>
      [
        systemRelatedIds.ipControlId,
        systemRelatedIds.browserControlId,
        systemRelatedIds.deviceControlId,
        systemRelatedIds.systemControlId,
        systemRelatedIds.extendSourceId,
      ].includes(control.controlId),
    )
    .map(control => control.controlId);
  return _.unique(defaultHided.concat(systemRelated).concat(hidedWhenNew));
}

export function overridePos(controls = [], newPosControls = []) {
  const newPos = [{}, ...newPosControls].reduce((a, b) =>
    _.assign({}, a, { [(b || {}).controlId]: _.pick(b || {}, ['col', 'row', 'size']) }),
  );
  const newControls = controls.map(control =>
    _.assign({}, control, newPos[control.controlId] ? newPos[control.controlId] : { col: -1, row: -1 }),
  );
  newControls.forEach((control, index) => {
    if (control.col === -1 && control.row === -1) {
      newControls[index] = {
        ...control,
        ...getNewControlColRow(newControls, control.half),
      };
    }
  });
  return newControls;
}
