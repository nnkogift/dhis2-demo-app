import {useAlert, useDataMutation, useDataQuery} from "@dhis2/app-runtime";
import {Modal, ModalActions, ModalContent, ModalTitle, ButtonStrip, Button, InputField} from "@dhis2/ui"
import React from "react";
import {FormProvider, useForm} from "react-hook-form";
import {RHFDHIS2FormField, RHFSingleSelectField} from "@hisptz/dhis2-ui";
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod";
import {compact, isEmpty} from "lodash";


const query: any = {
		dE: {
				resource: 'dataElements',
				params: ({name, shortName}) => {

						return {
								fields: [
										'id'
								],
								filter: compact([
										(name ? `name:eq:${name}` : undefined),
										(shortName ? `shortName:eq:${shortName}` : undefined),
								])
						}
				}
		}
}

const mutation: any = {
		resource: "dataElements",
		type: "create",
		params: {},
		data: ({data}: any) => data
}

export interface AddDataElementProps {
		hide: boolean;
		onClose: () => void,
		onSave: () => void;
}


export function AddDataElement({hide, onClose, onSave}: AddDataElementProps) {
		const {refetch, engine} = useDataQuery(query, {
				lazy: true
		})
		const {show, hide: hideAlert} = useAlert(({message}) => message, ({type}) => ({...type, duration: 3000}))
		const [mutate, {loading, error, data}] = useDataMutation(mutation, {
				onError: (error) => {
						show({message: error.message, type: {info: true}});
						new Promise((resolve) => setTimeout(resolve, 5000)).then(() => hideAlert());

				},
				onComplete: () => {
						show({message: "Data element added successfully", type: {success: true}});
						onSave();
				}
		});

		const DataElementSchema = z.object({
				name: z.string({
						required_error: "This field is required",
						invalid_type_error: "Name must be a string"
				}).refine(async (value) => {
						const response: any = await engine.query(query, {
								variables: {
										shortName: undefined,
										name: value
								}
						})
						return isEmpty(response?.dE?.dataElements)
				}, "A data element with the name exists"),
				shortName: z.string({
						required_error: "This field is required",
						invalid_type_error: "Short name must be a string"
				}).refine(async (value) => {
						const response: any = await engine.query(query, {
								variables: {
										shortName: value,
										name: undefined
								}
						})
						return isEmpty(response?.dE?.dataElements)

				}, "A data element with the short name exists"),
				valueType: z.enum(['TEXT', 'NUMBER'], {invalid_type_error: "Values should be either text or number"})
		});
		type DataElementFormData = z.infer<typeof DataElementSchema>

		const form = useForm<DataElementFormData>({
				resolver: zodResolver(DataElementSchema),
				shouldFocusError: false
		});


		const onSubmit = (data: DataElementFormData) => {

				const payload = {
						...data,
						domainType: 'TRACKER',
						aggregationType: 'NONE'
				}
				mutate({
						data: payload
				})
		}

		return (
				<Modal hide={hide} onClose={onClose}>
						<ModalTitle>
								Add data element
						</ModalTitle>
						<ModalContent>
								<FormProvider {...form}>
										<div>
												<RHFDHIS2FormField
														required label="Name" valueType="TEXT" name="name"/>
												<RHFDHIS2FormField required label="Short Name" valueType="TEXT" name="shortName"/>
												<RHFSingleSelectField label="Value type" options={[
														{
																label: "Text",
																value: "TEXT"
														},
														{
																label: "Number",
																value: "NUMBER"
														}
												]} name="valueType"/>
										</div>
								</FormProvider>
						</ModalContent>
						<ModalActions>
								<ButtonStrip>
										<Button onClick={onClose}>Cancel</Button>
										<Button loading={loading} onClick={form.handleSubmit(onSubmit)}
														primary>{loading ? "Saving..." : "Save"}</Button>
								</ButtonStrip>
						</ModalActions>
				</Modal>
		)

}
