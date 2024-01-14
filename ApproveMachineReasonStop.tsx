import { Box, Card, CardContent, Grid } from "@mui/material";
import DHSBreadcrumb from "../../../../../components/DHS/DHS_Breadcrumb/DHSBreadcrumb";
import { useLocation } from "react-router-dom";
import DHSDataGridEdit from "../../../../../components/DHSComponents/data-grid/DHS_DataGridEdit/DHSDataGridEdit";
import { AppSession } from "../../../../shared/app-session/app-session";
import { MachineDownTimeClient, PDMachineDowntimeApproveParams, PDMachineDowntimeDetail, PDMachineDowntimeDetailApproveGetParams, SysActionType } from "../../../../shared/service-proxies/api-shared";
import { useSelector } from "react-redux";
import { IReducer } from "../../../../../components/layouts";
import DataGrid from "devextreme-react/data-grid";
import React from "react";
import BASE_URL_API from "../../../../shared/service-proxies/config";
import DHSToolbarRole from "../../../../../components/DHS/DHS-Toolbar-Role/DHSToolbarRole";
import { checkRequiredField } from "../../../../../components/utils/object.util";
import BlockUI from "../../../../../components/Block-UI/Block-ui";
import { TransDateTime } from "../../../../../components/utils/date.util";
import ApproveMachineDowntimeFilter, { IMachineDowntimeFilter } from "./filter/ApproveMachineDowntimeFilter";
import { ACTIONS } from "../../../../../common/enums/DHSToolbarRoleAction";
import { getListDataRowSelected, getListIndexRowSelected } from "../../../../../components/DHSComponents/multi-header/helper-datagrid-edit-get-row";
import { IAction, ILoadingPanel } from "../../../../../common/Interfaces/Interfaces";
import notification from "../../../../../common/notification/notification";
import { STATUS_MESSAGE, TYPE_MESSAGE } from "../../../../../common/Interfaces/StatusMessage";
import _ from "lodash";
import DHSConfirmWithMessage from "../../../../../components/DHSUtilComponents/DHSConfirm/DHSConfirmWithMessage";

let appSession: AppSession;

interface IProps {

}

const defaultAction: IAction = {
    open: false,
    type: "",
    index: 0,
    payload: null
}

const defaultMachineReasonStopFilter: IMachineDowntimeFilter = {
    work_shift_id: undefined,
    machine_group_id: undefined,
    machine_id: undefined,
    timeFrom: new Date(new Date().setHours(6, 0, 0, 0)),
    timeTo: new Date(new Date().setHours(14, 0, 0, 0)),
}
const ApproveMachineReasonStop: React.FC<IProps> = () => {

    const location = useLocation();

    const SessionLogin = JSON.parse(localStorage.getItem("SessionLogin") || "{}")

    const menu = useSelector((state: IReducer) => state.RoleReducer?.menu)

    const dataGridRef = React.useRef<DataGrid>(null);
    const [reloadDS, setReloadDS] = React.useState<boolean>(false);
    const machineDowntimeClient = new MachineDownTimeClient(appSession, BASE_URL_API);
    const [choosenOpen, setChoosenOpen] = React.useState<boolean>(false);
    const [machineDowntime, setMachineDowntime] = React.useState<PDMachineDowntimeDetail[]>([]);
    const [confirmInfo, setConfirmInfo] = React.useState<{ title: string, message: string }>();
    const [approveMachineDowntimeFilter, setMachineDowntimeFilter] = React.useState<IMachineDowntimeFilter | undefined>(defaultMachineReasonStopFilter);
    const [actCx, setActCx] = React.useState<IAction<PDMachineDowntimeDetail[]>>(defaultAction);
    const [isLoading, setLoading] = React.useState<boolean>(false);
    const [loading, setLoad] = React.useState<ILoadingPanel>({ open: false } as ILoadingPanel);

    const getData = () => {
        (async () => {
            try {
                if (checkRequiredField(approveMachineDowntimeFilter, ["timeFrom", "timeTo"]) && menu?.menuid) {
                    setLoading(true);
                    console.log(loading.open);
                    const responseMachineDowntime = await machineDowntimeClient.pDMachineDowntimeDetailApproveGet({
                        ma_cty: SessionLogin.ma_cty,
                        machine_id: approveMachineDowntimeFilter?.machine_id,
                        timeFrom: approveMachineDowntimeFilter?.timeFrom ? TransDateTime(approveMachineDowntimeFilter?.timeFrom) : undefined,
                        timeTo: approveMachineDowntimeFilter?.timeTo ? TransDateTime(approveMachineDowntimeFilter?.timeTo) : undefined,
                    } as PDMachineDowntimeDetailApproveGetParams)
                    setLoading(false);
                    setMachineDowntime(responseMachineDowntime);
                }
            } catch (error) {
                console.log(error);
            }
        })()
    }

    React.useEffect(() => {
        getData();
    }, [approveMachineDowntimeFilter, menu?.menuid])

    const handleClickAction = async (action: SysActionType) => {

        switch (action?.action_code?.toLocaleUpperCase()) {
            case ACTIONS.APPROVED: {
                console.log("APPROVED");
                if (dataGridRef.current) {
                    try {
                        await dataGridRef.current.instance.saveEditData();
                        const dataSelected = await getListDataRowSelected<PDMachineDowntimeDetail>(dataGridRef);
                        const index = await getListIndexRowSelected(dataGridRef);

                        if (dataGridRef.current && dataSelected && index.length) {
                            setActCx({
                                open: false,
                                type: ACTIONS.APPROVED,
                                payload: dataSelected
                            })
                            setConfirmInfo({
                                title: "Duyệt thời gian dừng từ phiếu nhập",
                                message: "Bạn có chắc muốn duyệt?"
                            })
                            setChoosenOpen(true)
                        } else {
                            notification(
                                TYPE_MESSAGE.WARNING,
                                STATUS_MESSAGE[`WARNING_SELECT_ROW`]
                            )
                        }
                    } catch (error) {
                        notification(
                            TYPE_MESSAGE.WARNING,
                            STATUS_MESSAGE[`WARNING_SELECT_ROW`]
                        )
                    }
                }
                break;
            }
            case ACTIONS.REJECT:
                {
                    console.log("REJECTED");
                    if (dataGridRef.current) {
                        try {
                            await dataGridRef.current.instance.saveEditData();
                            const dataSelected = await getListDataRowSelected<PDMachineDowntimeDetail>(dataGridRef);
                            const index = await getListIndexRowSelected(dataGridRef);

                            if (dataGridRef.current && dataSelected && index.length) {
                                setActCx({
                                    open: false,
                                    type: ACTIONS.REJECT,
                                    payload: dataSelected
                                })
                                setConfirmInfo({
                                    title: "Từ chối duyệt thời gian dừng từ phiếu nhập",
                                    message: "Bạn có chắc muốn từ chối?"
                                })
                                setChoosenOpen(true)

                            } else {
                                notification(
                                    TYPE_MESSAGE.WARNING,
                                    STATUS_MESSAGE[`WARNING_SELECT_ROW`]
                                )
                            }
                        } catch (error) {
                            notification(
                                TYPE_MESSAGE.WARNING,
                                STATUS_MESSAGE[`WARNING_SELECT_ROW`]
                            )
                        }
                    }
                    break;
                }

            default:
                break;
        }
    }

    const handleApproval = async () => {
        try {
            if (_.isArray(actCx.payload)) {
                const body = actCx.payload.map<PDMachineDowntimeApproveParams>(x => ({
                    ma_cty: x?.ma_cty,
                    id: x?.id,
                    status: 1,
                    approveby: SessionLogin.userName,
                } as PDMachineDowntimeApproveParams))
                setLoad({
                    open: true,
                })
                const response = await machineDowntimeClient.pDMachineDowntimeApprove(body);

                notification(response.type_message, response.message);

                if (response.type_message === TYPE_MESSAGE.SUCCESS) {
                    dataGridRef?.current?.instance.option("SelectedRowKey", []);

                    setReloadDS(pre => !pre);
                    console.log(reloadDS);
                }

                setLoad({
                    open: false
                })
            } getData();
            console.log("APPROVED!");
        } catch (error) {
            setLoad({
                open: false
            })
        }
    }

    const handleReject = async () => {
        try {
            if (_.isArray(actCx.payload)) {
                const body = actCx.payload.map<PDMachineDowntimeApproveParams>(x => ({
                    ma_cty: x?.ma_cty,
                    id: x?.id,
                    status: 2,
                    approveby: SessionLogin.userName,
                } as PDMachineDowntimeApproveParams))
                setLoad({
                    open: true,
                })
                const response = await machineDowntimeClient.pDMachineDowntimeApprove(body);

                notification(response.type_message, response.message);

                if (response.type_message === TYPE_MESSAGE.SUCCESS) {
                    dataGridRef?.current?.instance.option("SelectedRowKey", []);

                    setReloadDS(pre => !pre);
                }

                setLoad({
                    open: false
                })
            }
            getData();
            console.log("REJECTED!");
        } catch (error) {
            setLoad({
                open: false
            })
        }
    }

    const handleComfirmChoosen = (isSubmit: boolean) => {
        if (isSubmit) {

            switch (actCx.type) {
                case ACTIONS.APPROVED:
                    handleApproval();

                    break;

                case ACTIONS.REJECT:
                    handleReject();

                    break;

                default: break;
            }
        }
    }

    return (
        <Box>
            <Box marginBottom={"0.5 rem"} padding={"0 1rem"}>
                <DHSBreadcrumb
                    location={location}
                />
            </Box>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Card elevation={1} sx={{ marginBottom: "0.5rem" }}>
                        <CardContent sx={{ paddingBottom: "0.5re!important" }}>
                            <ApproveMachineDowntimeFilter
                                filter={approveMachineDowntimeFilter}
                                onFilter={(e) => setMachineDowntimeFilter(pre => ({ ...pre, ...e } as IMachineDowntimeFilter))}
                            />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid>
                    <Card>
                        <DHSToolbarRole
                            id={" "}
                            menu={menu}
                            onClickAction={handleClickAction}
                        />
                    </Card>
                </Grid>
                <Grid>
                    <Card>
                        <CardContent>
                            <DHSDataGridEdit
                                data={machineDowntime}
                                dataGridRef={dataGridRef}
                                table_name="ApproveMachineReasonStop"
                                // keyExpr={"machine_id"}
                                key={"machine_id"}
                                allowEdit
                                className=""
                                pageSize={40}
                                isPagination={true}
                                isMultiple={true}
                                groupingAutoExpandAll={false}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <DHSConfirmWithMessage
                open={choosenOpen}
                onClosed={() => setChoosenOpen(pre => !pre)}
                showButton="ok_cancel"
                title={confirmInfo?.title ?? ""}
                message={confirmInfo?.message ?? ""}
                onSubmit={handleComfirmChoosen}
            />
            <BlockUI blocking={isLoading} title={"Vui lòng đợi"}></BlockUI>
        </Box>
    )
}


export default ApproveMachineReasonStop;