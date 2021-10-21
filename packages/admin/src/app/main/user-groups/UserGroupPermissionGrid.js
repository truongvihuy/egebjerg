import { memo } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import Checkbox from '@material-ui/core/Checkbox';

export const GridPermission = memo(props => {
	const PermissionCell = propsCell => {
		return (
			<td>
				{propsCell.dataItem[propsCell.field] === null ? null : (
					<Checkbox
						color='primary'
						checked={propsCell.dataItem[propsCell.field]}
						onChange={() => props.onChange(propsCell.dataItem.key, propsCell.field)}
						disabled={props.disabled}
					/>
				)}
			</td>
		);
	};
	const onChangeAll = (e, newFlag) => {
		props.onChange(e.dataItem.key, 'all', newFlag);
	};

	const CellName = propsCell => {
		let newFlag =
			propsCell.dataItem.type === 'group' || propsCell.dataItem.type === 'collapse'
				? !propsCell.dataItem.access
				: !(
					propsCell.dataItem.access &&
					propsCell.dataItem.get &&
					propsCell.dataItem.insert &&
					propsCell.dataItem.update &&
					propsCell.dataItem.delete
				);
		return (
			<td
				className="can-click"
				onClick={() => {
					onChangeAll(propsCell, newFlag);
					newFlag = !newFlag;
				}}>
				{propsCell.dataItem.title}
			</td>
		);
	};

	return props.permissionList ? (
		<Grid
			data={props.permissionList}
			className="text-center"
			style={{
				width: 710,
				height: 'calc(100vh - 220px)'
			}}>
			<GridColumn field="name" title="Navn" width="200px" cell={CellName} />
			<GridColumn field="access" title="Adgang" width="100px" editor="boolean" cell={PermissionCell} />
			<GridColumn field="get" title="Læse" width="100px" editor="boolean" cell={PermissionCell} />
			<GridColumn field="insert" title="Opret" width="100px" editor="boolean" cell={PermissionCell} />
			<GridColumn field="update" title="Opdatere" width="100px" editor="boolean" cell={PermissionCell} />
			<GridColumn field="delete" title="Slette" width="100px" editor="boolean" cell={PermissionCell} />
		</Grid>
	) : null;
});

export default GridPermission;
