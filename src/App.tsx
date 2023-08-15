import React, {useState, useRef, useEffect} from 'react'
import {
		Button,
		ButtonStrip,
		Table,
		TableHead,
		TableRowHead,
		TableCellHead,
		TableBody,
		TableRow,
		TableCell,
		IconAdd24,
		CircularLoader,
		Pagination,
		InputField
} from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import classes from './App.module.css'
import {useDataQuery} from "@dhis2/app-runtime";
import {DataElementDetails} from "./DataElementDetails";
import {debounce} from "lodash";
import {useBoolean, useDebounce, useUpdateEffect} from "usehooks-ts";
import {AddDataElement} from "./AddDataElement";
import "./locales"
const query = {
		dE: {
				resource: "dataElements",
				params: ({page, pageSize, search}: any) => {
						return {
								filter: search ? [
										`identifiable:token:${search}`
								] : undefined,
								fields: [
										"id", "displayName"
								],
								page,
								pageSize
						}
				}
		}
}


const MyApp = () => {
		const {value: hide, setTrue: hideModal, setFalse: showModal} = useBoolean(true)
		const [selectedId, setSelectedId] = useState<string | undefined>();
		const [search, setSearch] = useState<string | null>(null);
		const debouncedSearch = useDebounce(search, 1000)
		const {loading, data, error, refetch} = useDataQuery<{
				dE: {
						dataElements: { id: string; displayName: string }[],
						pager: { page: number, pageCount: number; total: number; pageSize: number }
				}
		}>(query, {
				variables: {
						page: 1,
						pageSize: 10
				}
		});

		useUpdateEffect(() => {
				refetch({
						page: 1,
						search: debouncedSearch
				})
		}, [debouncedSearch]);


		const onChange = (data: { value: string, name: string }) => {
				setSearch(data.value);
		}


		const onPageChange = (page: number) => {
				refetch({
						page
				})
		}

		const onPageSizeChange = (pageSize: number) => {
				refetch({
						pageSize,
						page: 1
				})
		}

		const onSave = () =>{
				hideModal()
				refetch()
		}


		if (error) {
				return (
						<div style={{
								width: "100%",
								height: "100%",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center"
						}}>
								<h1>Error</h1>
								<span>{error.message}</span>
								<Button onClick={refetch}>Refresh</Button>
						</div>
				)
		}

		return (
				<div style={{padding: 32, gap: 16}} className={classes.container}>
						<AddDataElement onSave={onSave} hide={hide} onClose={hideModal}/>
						<div style={{display: "flex", justifyContent: "space-between", gap: 32}}>
								<ButtonStrip>
										<Button onClick={showModal} icon={<IconAdd24/>} primary>Add data element</Button>
										<Button onClick={refetch}>Refresh</Button>
								</ButtonStrip>
								<InputField value={search} placeholder={i18n.t("Search")} onChange={onChange}/>
						</div>
						<div style={{flex: 1, display: "flex", flexDirection: "column", gap: 32}}>
								{
										loading ?
												<>
														<div style={{
																width: "100%",
																height: "100%",
																display: "flex",
																flexDirection: "column",
																alignItems: "center",
																justifyContent: "center"
														}}>
																<CircularLoader small/>
														</div>
												</> :
												<>
														<div style={{
																height: 800,
																width: "100%",
																overflow: "auto",
																display: "flex",
																flexDirection: "column",
																gap: 16
														}}>
																<Table>
																		<TableHead>
																				<TableRowHead>
																						<TableCellHead>{i18n.t("Id")}</TableCellHead>
																						<TableCellHead>{i18n.t("Name")}</TableCellHead>
																				</TableRowHead>
																		</TableHead>
																		<TableBody>
																				{
																						data?.dE.dataElements.map(({id, displayName}) => (
																								<TableRow key={`${id}-list-item`}>
																										<TableCell>
																												<div onClick={() => setSelectedId(id)}>
																														{id}
																												</div>
																										</TableCell>
																										<TableCell>{displayName}</TableCell>
																								</TableRow>
																						))
																				}
																		</TableBody>
																</Table>
																<Pagination
																		onPageChange={onPageChange}
																		onPageSizeChange={onPageSizeChange}
																		page={data?.dE.pager.page}
																		pageCount={data?.dE.pager.pageCount}
																		pageSize={data?.dE.pager.pageSize}
																		total={data?.dE?.pager.total}
																/>
														</div>
														{
																selectedId && (
																		<DataElementDetails id={selectedId}/>
																)
														}

												</>
								}
						</div>
				</div>
		)
}

export default MyApp
